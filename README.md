# 🎓 MHT-CET 2026 Cutoff & College Predictor

An all-in-one web application for MHT-CET engineering aspirants in Maharashtra to explore official 2026 CAP Round 1–4 cutoffs, predict eligible colleges based on percentile, compare courses side-by-side, and build preference option forms.

🚀 **Live:** [https://cet-vault.vercel.app](https://cet-vault.vercel.app)

---

## ✨ Features

- 🎯 **Smart College Predictor:** Compares a user percentile with the selected 2026 CAP round and reservation category.
- 📊 **Official CAP Cutoffs:** Category-wise data from all four supplied CET Cell PDFs, including merit number, percentile, stage, allocation block, and source context.
- 🔍 **Advanced Filtering:** Search 387 colleges and 2,332 course options by college, city, university, course, region, college type, category, round, or percentile range.
- ⚖️ **Side-by-Side Comparison:** Compare up to 3 colleges across every extracted course for the selected round and category.
- ⭐ **Cutoff-strength score:** A transparent score derived from the strongest published cutoff; it is not a review or official college rating.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Icons:** Lucide React
- **Data Pipeline:** Python (`pdfplumber`) and Node.js for parsing and structuring all four CAP 2026 PDFs into round-specific JSON.
- **Deployment:** Vercel

## Project structure

```text
src/
  app/        Application composition and navigation types
  features/   Feature-specific screens and components
  shared/     Reusable UI, layout, domain utilities, and types
  styles/     Global Tailwind styles
scripts/      Four-round extraction, generation, and validation utilities
```

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
npm run data:validate
```

## Data workflow

The four source PDFs are read from:

```text
public/round1_26.pdf
public/round2_26.pdf
public/round3_26.pdf
public/round4_26.pdf
```

Create a Python environment before extracting:

```bash
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
npm run data:extract
npm run data:generate
npm run data:validate
```

`npm run data:extract` creates `data/source/colleges-2026.json`. The extractor preserves every college/course combination and records each cutoff fact with its round, category, merit number, percentile, stage, allocation block, and source page/table.

`npm run data:generate` creates four lazy-loaded datasets:

```text
public/data/colleges-2026-round1.json
public/data/colleges-2026-round2.json
public/data/colleges-2026-round3.json
public/data/colleges-2026-round4.json
```

Missing course/category/round data remains missing; values are never copied from another round. College location is derived from the PDF institution name when possible. Fees, websites, intake, and establishment year are shown as unavailable when the PDFs do not provide them.
