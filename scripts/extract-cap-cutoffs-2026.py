"""Extract all four MHT-CET CAP 2026 cutoff PDFs into one round-aware dataset.

The PDFs are Crystal Reports exports.  Their tables contain the official merit
number and percentile, while the surrounding page text contains the college,
course, status, university, allocation block, and stage context.  The parser
keeps those values separate so a missing value in one round is never filled
from another round.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data/source/colleges-2026.json"
ROUND_FILES = {
    1: ROOT / "public/round1_26.pdf",
    2: ROOT / "public/round2_26.pdf",
    3: ROOT / "public/round3_26.pdf",
    4: ROOT / "public/round4_26.pdf",
}

COLLEGE_RE = re.compile(r"^(\d{4,5})\s*[-–—:]\s*(.+?)\s*$")
COURSE_RE = re.compile(r"^(\d{9,10}[A-Z]?)\s*[-–—:]\s*(.+?)\s*$")
STATUS_RE = re.compile(
    r"^Status:\s*(.*?)\s+Home University\s*:\s*(.*?)\s*$",
    re.IGNORECASE,
)
PERCENTILE_RE = re.compile(r"\(\s*(\d+(?:\.\d+)?)\s*\)")
MERIT_RE = re.compile(r"^\s*(\d{1,7})\s*$")
STAGE_RE = re.compile(
    r"^(?P<label>(?:I{1,3}|IV|V|VI|VII|VIII|MH)(?:-Non)?(?:\s+(?:PWD|Defence))?)\b",
    re.IGNORECASE,
)

ALLOCATION_LABELS = (
    "Home University Seats Allotted to Home University Candidates",
    "Home University Seats Allotted to Other Than Home University Candidates",
    "Other Than Home University Seats Allotted to Home University Candidates",
    "Other Than Home University Seats Allotted to Other Than Home University Candidates",
    "State Level",
)

# The PDF does not contain a dedicated city column.  These names are used only
# to derive a searchable display location from the institution name; the raw
# college name and source status remain authoritative.
CITY_NAMES = (
    "Chhatrapati Sambhajinagar",
    "Aurangabad",
    "Ahmednagar",
    "Buldhana",
    "Chandrapur",
    "Gondia",
    "Yavatmal",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Amravati",
    "Akola",
    "Beed",
    "Dhule",
    "Bhandara",
    "Karad",
    "Kalyan",
    "Mira-Bhayandar",
    "Vasai",
    "Virar",
    "Pimpri",
    "Loni",
    "Baramati",
    "Shahada",
    "Ramtek",
    "Hingoli",
)

REGION_BY_CITY = {
    "Mumbai": "Mumbai & Thane",
    "Thane": "Mumbai & Thane",
    "Palghar": "Mumbai & Thane",
    "Raigad": "Mumbai & Thane",
    "Pune": "Pune Region",
    "Pimpri": "Pune Region",
    "Loni": "Pune Region",
    "Baramati": "Pune Region",
    "Nagpur": "Nagpur Region",
    "Ramtek": "Nagpur Region",
    "Nashik": "Nashik Region",
    "Dhule": "Nashik Region",
    "Nandurbar": "Nashik Region",
    "Jalgaon": "Nashik Region",
    "Sangli": "Sangli/Kolhapur",
    "Kolhapur": "Sangli/Kolhapur",
    "Satara": "Sangli/Kolhapur",
    "Amravati": "Amravati Region",
    "Akola": "Amravati Region",
    "Buldhana": "Amravati Region",
    "Washim": "Amravati Region",
    "Nanded": "Nanded Region",
    "Latur": "Nanded Region",
    "Parbhani": "Nanded Region",
    "Hingoli": "Nanded Region",
    "Solapur": "Solapur Region",
    "Beed": "Chh. Sambhajinagar Region",
    "Chhatrapati Sambhajinagar": "Chh. Sambhajinagar Region",
    "Aurangabad": "Chh. Sambhajinagar Region",
    "Ahmednagar": "Chh. Sambhajinagar Region",
    "Jalna": "Chh. Sambhajinagar Region",
}


def normalize_space(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def is_category(value: str | None) -> bool:
    token = normalize_space(value).replace("\n", "")
    if token.upper() in {"STAGE", "NONE", "NULL"}:
        return False
    return bool(re.fullmatch(r"[A-Z][A-Z0-9]{1,}", token.upper()))


def normalize_category(value: str | None) -> str | None:
    token = normalize_space(value).replace("\n", "").upper()
    return token if is_category(token) else None


def normalize_stage(value: str | None) -> str | None:
    text = normalize_space(value).replace("\n", " ")
    match = STAGE_RE.match(text)
    return normalize_space(match.group("label")) if match else None


def parse_status(value: str) -> tuple[str | None, str | None]:
    match = STATUS_RE.match(normalize_space(value))
    if not match:
        return normalize_space(value.removeprefix("Status:")), None
    return normalize_space(match.group(1)), normalize_space(match.group(2))


def derive_city(name: str) -> str | None:
    normalized = normalize_space(name)
    for city in sorted(CITY_NAMES, key=len, reverse=True):
        if re.search(rf"(?<![A-Za-z]){re.escape(city)}(?![A-Za-z])", normalized, re.IGNORECASE):
            return city
    if "," in normalized:
        suffix = normalize_space(normalized.rsplit(",", 1)[1])
        if suffix and len(suffix) < 40:
            return suffix
    return None


def derive_region(city: str | None) -> str | None:
    return REGION_BY_CITY.get(city or "", "Other Maharashtra") if city else None


def derive_ownership(status: str | None) -> str | None:
    text = (status or "").lower()
    if "government-aided" in text or "government aided" in text:
        return "Government-Aided"
    if "government" in text:
        return "Government"
    if "un-aided" in text or "unaided" in text or "private" in text:
        return "Private/Un-Aided"
    if "university" in text:
        return "University"
    return None


def parse_cutoff_cell(value: Any) -> tuple[int | None, float] | None:
    text = normalize_space(str(value) if value is not None else "")
    percentile_match = PERCENTILE_RE.search(text)
    if not percentile_match:
        return None
    percentile = float(percentile_match.group(1))
    before_percentile = text[: percentile_match.start()]
    merit_match = re.search(r"(\d{1,7})", before_percentile)
    merit_number = int(merit_match.group(1)) if merit_match else None
    if not 0 <= percentile <= 100:
        return None
    return merit_number, percentile


def context_from_lines(
    lines: list[dict[str, Any]],
    top: float,
    context: dict[str, Any],
) -> dict[str, Any]:
    updated = copy.deepcopy(context)
    for line in sorted(lines, key=lambda item: item.get("top", 0)):
        if line.get("top", 0) >= top:
            break
        text = normalize_space(line.get("text", ""))
        college_match = COLLEGE_RE.match(text)
        if college_match:
            updated["college_code"] = college_match.group(1).zfill(5)
            updated["college_name"] = normalize_space(college_match.group(2))
            updated["course_code"] = None
            updated["course_name"] = None
            updated["status"] = None
            updated["home_university"] = None
            updated["allocation"] = None
            updated["stage"] = None
            continue
        course_match = COURSE_RE.match(text)
        if course_match:
            updated["course_code"] = course_match.group(1)
            updated["course_name"] = normalize_space(course_match.group(2))
            updated["stage"] = None
            continue
        if text.lower().startswith("status:"):
            status, home_university = parse_status(text)
            updated["status"] = status
            updated["home_university"] = home_university
            continue
        if text in ALLOCATION_LABELS:
            updated["allocation"] = text
            continue
    return updated


def extract_table_rows(table: Any) -> tuple[list[tuple[int, str]], list[list[Any]]]:
    rows = table.extract() or []
    if not rows:
        return [], []

    header: list[tuple[int, str]] = []
    for index, cell in enumerate(rows[0]):
        category = normalize_category(cell)
        if category:
            header.append((index, category))
    if not header:
        return [], rows
    return header, rows[1:]


def upsert_college(colleges: dict[str, Any], context: dict[str, Any]) -> dict[str, Any] | None:
    code = context.get("college_code")
    name = context.get("college_name")
    if not code or not name:
        return None
    college = colleges.setdefault(
        code,
        {
            "code": code,
            "name": name,
            "shortName": normalize_space(name.split(",", 1)[0])[:80],
            "city": derive_city(name),
            "region": derive_region(derive_city(name)),
            "status": None,
            "homeUniversity": None,
            "ownership": None,
            "autonomous": None,
            "minority": None,
            "established": None,
            "fees": None,
            "website": None,
            "rating": None,
            "metadataSource": "2026 CAP PDF; location derived from college name",
            "branches": {},
            "_statusObservations": [],
        },
    )
    if college["name"] != name:
        college.setdefault("nameObservations", []).append(name)
    if context.get("status"):
        college["_statusObservations"].append(
            {
                "status": context.get("status"),
                "homeUniversity": context.get("home_university"),
            }
        )
    return college


def add_table_cutoffs(
    colleges: dict[str, Any],
    context: dict[str, Any],
    table: Any,
    round_number: int,
    page_number: int,
    table_number: int,
) -> int:
    college = upsert_college(colleges, context)
    if college is None or not context.get("course_code"):
        return 0
    branch = college["branches"].setdefault(
        context["course_code"],
        {
            "code": context["course_code"],
            "name": context.get("course_name") or context["course_code"],
            "intake": None,
            "cutoffs2026": {"1": {}, "2": {}, "3": {}, "4": {}},
        },
    )
    if context.get("course_name") and branch["name"] != context["course_name"]:
        branch.setdefault("nameObservations", []).append(context["course_name"])

    header, rows = extract_table_rows(table)
    if not header:
        return 0

    values_added = 0
    stage_fallback = context.get("stage") or "I"
    allocation = context.get("allocation") or "Unknown allocation"
    for row in rows:
        if not row:
            continue
        row_stage = normalize_stage(row[0]) if len(row) > 0 else None
        stage = row_stage or stage_fallback
        if row_stage:
            stage_fallback = row_stage
            context["stage"] = row_stage
        for index, category in header:
            if index >= len(row):
                continue
            parsed = parse_cutoff_cell(row[index])
            if parsed is None:
                continue
            merit_number, percentile = parsed
            branch["cutoffs2026"][str(round_number)].setdefault(category, []).append(
                {
                    "percentile": percentile,
                    "meritNumber": merit_number,
                    "stage": stage,
                    "allocation": allocation,
                    "source": {
                        "pdf": f"round{round_number}_26.pdf",
                        "page": page_number,
                        "table": table_number,
                    },
                }
            )
            values_added += 1
    return values_added


def finalize_colleges(colleges: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for college in colleges.values():
        observations = college.pop("_statusObservations", [])
        if observations:
            status_counts = Counter(item["status"] for item in observations if item.get("status"))
            home_counts = Counter(item["homeUniversity"] for item in observations if item.get("homeUniversity"))
            college["status"] = status_counts.most_common(1)[0][0] if status_counts else None
            college["homeUniversity"] = home_counts.most_common(1)[0][0] if home_counts else None
            college["ownership"] = derive_ownership(college["status"])
            college["autonomous"] = "autonomous" in (
                f"{college.get('status') or ''} {college.get('homeUniversity') or ''}"
            ).lower()
        college["branches"] = sorted(college["branches"].values(), key=lambda branch: branch["code"])
        output.append(college)
    return sorted(output, key=lambda college: college["code"])


def extract(rounds: list[int]) -> dict[str, Any]:
    colleges: dict[str, Any] = {}
    stats: dict[str, Any] = {str(round_number): {"pages": 0, "tables": 0, "cutoffs": 0} for round_number in rounds}

    for round_number in rounds:
        pdf_path = ROUND_FILES[round_number]
        if not pdf_path.exists():
            raise FileNotFoundError(f"Missing CAP PDF: {pdf_path}")
        print(f"Reading Round {round_number}: {pdf_path.name}", file=sys.stderr)
        context: dict[str, Any] = {
            "college_code": None,
            "college_name": None,
            "course_code": None,
            "course_name": None,
            "status": None,
            "home_university": None,
            "allocation": None,
            "stage": None,
        }
        with pdfplumber.open(pdf_path) as pdf:
            stats[str(round_number)]["pages"] = len(pdf.pages)
            for page_number, page in enumerate(pdf.pages, start=1):
                lines = page.extract_text_lines() or []
                tables = sorted(page.find_tables(), key=lambda found: found.bbox[1])
                for table_number, table in enumerate(tables, start=1):
                    context = context_from_lines(lines, table.bbox[1], context)
                    stats[str(round_number)]["cutoffs"] += add_table_cutoffs(
                        colleges,
                        context,
                        table,
                        round_number,
                        page_number,
                        table_number,
                    )
                stats[str(round_number)]["tables"] += len(tables)

    finalized = finalize_colleges(colleges)
    return {
        "schemaVersion": "2026-cap-v1",
        "academicYear": "2026-27",
        "rounds": [
            {
                "number": round_number,
                "label": f"CAP Round {round_number}",
                "pdf": f"round{round_number}_26.pdf",
            }
            for round_number in rounds
        ],
        "stats": stats,
        "colleges": finalized,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--round", type=int, action="append", choices=(1, 2, 3, 4), dest="rounds")
    args = parser.parse_args()
    rounds = args.rounds or [1, 2, 3, 4]
    dataset = extract(rounds)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding="utf-8")
    colleges = dataset["colleges"]
    branches = sum(len(college["branches"]) for college in colleges)
    cutoff_count = sum(
        len(values)
        for college in colleges
        for branch in college["branches"]
        for round_values in branch["cutoffs2026"].values()
        for values in round_values.values()
    )
    print(
        f"Extracted {len(colleges)} colleges, {branches} courses, and {cutoff_count} cutoff facts into {args.output}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
