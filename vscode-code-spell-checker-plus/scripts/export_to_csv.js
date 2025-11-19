const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(dir)) {
  console.error('generated/ not found. Run extraction first.');
  process.exit(1);
}

function toCsv(arr) {
  // simple CSV with one column 'term'
  const lines = ['term'];
  for (const v of arr) lines.push(String(v).replace(/"/g, '""'));
  return lines.join('\n');
}

const files = fs.readdirSync(dir).filter(f => f.startsWith('terms-') && f.endsWith('.json'));
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const csv = toCsv(data);
    const out = path.join(dir, f.replace('.json', '.csv'));
    fs.writeFileSync(out, csv, 'utf8');
    console.log('Wrote', out);
  } catch (e) {
    console.error('Error processing', f, e.message);
  }
}

// Also export a combined review CSV with domain column
try {
  const summary = [];
  for (const domain of ['frontend','backend','ai','other']) {
    const fn = path.join(dir, `terms-${domain}.json`);
    if (!fs.existsSync(fn)) continue;
    const arr = JSON.parse(fs.readFileSync(fn, 'utf8'));
    for (const t of arr) summary.push({ term: t, domain });
  }
  const header = ['term,domain'];
  const lines = [header.join(',')];
  for (const r of summary) lines.push(`"${String(r.term).replace(/"/g,'""')}",${r.domain}`);
  const out = path.join(dir, 'terms-review.csv');
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log('Wrote', out);
} catch (e) {
  console.error('Error writing combined review CSV', e.message);
}
