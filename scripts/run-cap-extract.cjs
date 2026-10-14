const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const extractor = path.join(__dirname, 'extract-cap-cutoffs-2026.py');
const candidates = [
  process.env.PYTHON,
  path.join(root, 'venv/bin/python'),
  'python3',
].filter(Boolean);

for (const python of candidates) {
  if (python !== 'python3' && !fs.existsSync(python)) continue;
  const result = spawnSync(python, [extractor, ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status === 0) process.exit(0);
  if (result.error?.code !== 'ENOENT') process.exit(result.status ?? 1);
}

console.error('Could not find a usable Python interpreter. Set PYTHON or create venv with pdfplumber installed.');
process.exit(1);
