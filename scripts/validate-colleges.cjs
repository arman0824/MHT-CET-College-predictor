const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'data/source/colleges-2026.json');
const rounds = [1, 2, 3, 4];

function fail(message) {
  console.error(`Data validation failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) fail('2026 source dataset is missing.');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (source.schemaVersion !== '2026-cap-v1' || !Array.isArray(source.colleges)) fail('source schema is invalid.');

const collegeCodes = new Set();
let sourceCourses = 0;
let sourceCutoffs = 0;
for (const college of source.colleges) {
  if (!college.code || collegeCodes.has(college.code)) fail(`duplicate or missing college code: ${college.code}`);
  collegeCodes.add(college.code);
  const branchCodes = new Set();
  for (const branch of college.branches) {
    sourceCourses += 1;
    if (!branch.code || branchCodes.has(branch.code)) fail(`duplicate or missing course code in ${college.code}`);
    branchCodes.add(branch.code);
    for (const round of rounds) {
      const categories = branch.cutoffs2026[String(round)] || {};
      for (const values of Object.values(categories)) {
        if (!Array.isArray(values)) fail(`invalid category data for ${branch.code}`);
        for (const cutoff of values) {
          sourceCutoffs += 1;
          if (!Number.isFinite(cutoff.percentile) || cutoff.percentile < 0 || cutoff.percentile > 100) {
            fail(`invalid percentile for ${branch.code}`);
          }
          if (cutoff.meritNumber !== null && (!Number.isInteger(cutoff.meritNumber) || cutoff.meritNumber < 1)) {
            fail(`invalid merit number for ${branch.code}`);
          }
        }
      }
    }
  }
}

for (const round of rounds) {
  const outputPath = path.join(root, `public/data/colleges-2026-round${round}.json`);
  if (!fs.existsSync(outputPath)) fail(`generated Round ${round} dataset is missing.`);
  const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  if (data.schemaVersion !== '2026-cap-v1-round' || data.round !== round || !Array.isArray(data.colleges)) {
    fail(`generated Round ${round} schema is invalid.`);
  }
  const ratings = new Set();
  for (const college of data.colleges) {
    if (!college.code || !Array.isArray(college.branches)) fail(`invalid generated college in Round ${round}`);
    if (college.rating !== null) ratings.add(college.rating);
    for (const branch of college.branches) {
      for (const values of Object.values(branch.cutoffs || {})) {
        if (!Array.isArray(values)) fail(`invalid generated cutoff array in Round ${round}`);
        for (const cutoff of values) {
          if (!Number.isFinite(cutoff.percentile) || cutoff.percentile < 0 || cutoff.percentile > 100) {
            fail(`invalid generated percentile in Round ${round}`);
          }
        }
      }
    }
  }
  if (ratings.size < 2) fail(`Round ${round} ratings are not being derived from cutoff data.`);
}

console.log(JSON.stringify({
  valid: true,
  colleges: source.colleges.length,
  courses: sourceCourses,
  cutoffFacts: sourceCutoffs,
  rounds,
}, null, 2));
