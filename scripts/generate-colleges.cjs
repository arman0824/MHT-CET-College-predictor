const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../data/source/colleges-2026.json');
const outputDir = path.resolve(__dirname, '../public/data');
const rounds = [1, 2, 3, 4];

if (!fs.existsSync(sourcePath)) {
  console.error(`Error: ${sourcePath} was not found. Run npm run data:extract first.`);
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (source.schemaVersion !== '2026-cap-v1') {
  console.error(`Error: unsupported source schema ${source.schemaVersion}`);
  process.exit(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cutoffRating(college, round) {
  const percentiles = college.branches.flatMap((branch) =>
    Object.values(branch.cutoffs2026[String(round)] || {}).flatMap((values) =>
      values.map((cutoff) => cutoff.percentile),
    ),
  );

  if (percentiles.length === 0) return null;

  // This is intentionally a transparent cutoff-strength score, not a review
  // rating. A 100th-percentile published cutoff maps to 5 and 0 to 1.
  const strongestCutoff = Math.max(...percentiles);
  return clamp(Math.round((1 + strongestCutoff / 25) * 2) / 2, 1, 5);
}

function publicCutoff(cutoff) {
  return {
    percentile: Number(cutoff.percentile.toFixed(7)),
    meritNumber: cutoff.meritNumber ?? null,
    stage: cutoff.stage || null,
    allocation: cutoff.allocation || null,
  };
}

function publicCollege(college, round) {
  return {
    code: college.code,
    name: college.name,
    shortName: college.shortName,
    city: college.city,
    region: college.region,
    status: college.status,
    homeUniversity: college.homeUniversity,
    ownership: college.ownership,
    autonomous: college.autonomous,
    minority: college.minority,
    established: college.established,
    fees: college.fees,
    website: college.website,
    rating: cutoffRating(college, round),
    ratingSource: 'Derived from strongest published 2026 CAP cutoff',
    metadataSource: college.metadataSource,
    branches: college.branches.map((branch) => {
      const sourceCutoffs = college.branches.length > 0
        ? branch.cutoffs2026[String(round)] || {}
        : {};
      const cutoffs = Object.fromEntries(
        Object.entries(sourceCutoffs).map(([category, values]) => [
          category,
          values.map(publicCutoff),
        ]),
      );

      return {
        code: branch.code,
        name: branch.name,
        intake: branch.intake,
        cutoffs,
      };
    }),
  };
}

fs.mkdirSync(outputDir, { recursive: true });
const legacyOutput = path.join(outputDir, 'colleges.json');
if (fs.existsSync(legacyOutput)) fs.rmSync(legacyOutput);

for (const round of rounds) {
  const output = {
    schemaVersion: '2026-cap-v1-round',
    academicYear: '2026-27',
    round,
    label: `CAP Round ${round}`,
    pdf: `/round${round}_26.pdf`,
    colleges: source.colleges.map((college) => publicCollege(college, round)),
  };
  const outputPath = path.join(outputDir, `colleges-2026-round${round}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
  console.log(`Generated ${outputPath}`);
}
