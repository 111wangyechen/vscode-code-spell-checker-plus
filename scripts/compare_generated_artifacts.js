const fs = require('fs');
const path = require('path');

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return { __error: `failed to parse ${p}: ${e.message}` };
  }
}

function readTextSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
}

function compareJson(a, b) {
  if (typeof a !== typeof b) return false;
  return JSON.stringify(a, Object.keys(a).sort(), 2) === JSON.stringify(b, Object.keys(b).sort(), 2);
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const localDir = path.join(repoRoot, 'generated');
  const artDir = path.join(repoRoot, 'generated_artifacts');
  const reportPath = path.join(artDir, 'qa_report.txt');
  ensureDir(artDir);

  const report = [];
  report.push(`QA report generated at ${new Date().toISOString()}`);
  report.push('');

  if (!fs.existsSync(localDir)) {
    report.push(`ERROR: local generated directory not found: ${localDir}`);
    fs.writeFileSync(reportPath, report.join('\n'));
    console.log(`Wrote report to ${reportPath}`);
    return;
  }

  if (!fs.existsSync(artDir)) {
    report.push(`ERROR: artifact directory not found: ${artDir}`);
    fs.writeFileSync(reportPath, report.join('\n'));
    console.log(`Wrote report to ${reportPath}`);
    return;
  }

  const localFiles = fs.readdirSync(localDir).filter(f => !f.startsWith('.'));
  const artFiles = fs.readdirSync(artDir).filter(f => !f.startsWith('.'));

  report.push(`Local generated files (${localFiles.length}): ${localFiles.join(', ')}`);
  report.push(`Artifact files (${artFiles.length}): ${artFiles.join(', ')}`);
  report.push('');

  // For each local file, try to find matching artifact file
  for (const lf of localFiles) {
    const localPath = path.join(localDir, lf);
    const artPath = path.join(artDir, lf);
    report.push(`--- Comparing ${lf} ---`);
    if (!fs.existsSync(artPath)) {
      report.push(`MISSING in artifacts: ${lf}`);
      report.push('');
      continue;
    }

    if (lf.endsWith('.json')) {
      const a = readJsonSafe(localPath);
      const b = readJsonSafe(artPath);
      if (a && a.__error) report.push(`LOCAL PARSE ERROR: ${a.__error}`);
      if (b && b.__error) report.push(`ARTIFACT PARSE ERROR: ${b.__error}`);
      const same = compareJson(a, b);
      report.push(`JSON equal: ${same}`);
      if (!same) {
        // show small diff: keys only
        const aKeys = Object.keys(a || {}).sort();
        const bKeys = Object.keys(b || {}).sort();
        const onlyA = aKeys.filter(x => !bKeys.includes(x));
        const onlyB = bKeys.filter(x => !aKeys.includes(x));
        report.push(`Keys only in local (${onlyA.length}): ${onlyA.slice(0,10).join(', ')}`);
        report.push(`Keys only in artifact (${onlyB.length}): ${onlyB.slice(0,10).join(', ')}`);
      }
    } else if (lf.endsWith('.csv') || lf.endsWith('.txt')) {
      const la = readTextSafe(localPath);
      const lb = readTextSafe(artPath);
      if (la === null) report.push(`LOCAL READ ERROR: ${localPath}`);
      if (lb === null) report.push(`ARTIFACT READ ERROR: ${artPath}`);
      const equal = la === lb;
      report.push(`Text equal: ${equal}`);
      if (!equal) {
        const laLines = (la||'').split(/\r?\n/);
        const lbLines = (lb||'').split(/\r?\n/);
        report.push(`Local lines: ${laLines.length}, Artifact lines: ${lbLines.length}`);
        // show up to 10 differing lines
        let diffs = 0;
        for (let i=0;i<Math.max(laLines.length, lbLines.length) && diffs<10;i++){
          const aLine = laLines[i]||'';
          const bLine = lbLines[i]||'';
          if (aLine !== bLine) {
            diffs++;
            report.push(`line ${i+1} LOCAL: ${aLine}`);
            report.push(`line ${i+1} ARTIFACT: ${bLine}`);
          }
        }
        if (diffs>=10) report.push('...more differences omitted...');
      }
    } else {
      // binary or other
      const laStat = fs.statSync(localPath);
      const lbStat = fs.statSync(artPath);
      report.push(`File sizes - local: ${laStat.size}, artifact: ${lbStat.size}`);
    }
    report.push('');
  }

  // Also list artifact-only files
  const localSet = new Set(localFiles);
  const onlyArtifacts = artFiles.filter(f => !localSet.has(f));
  if (onlyArtifacts.length) {
    report.push(`Files present only in artifacts (${onlyArtifacts.length}): ${onlyArtifacts.join(', ')}`);
  }

  fs.writeFileSync(reportPath, report.join('\n'));
  console.log(`Wrote QA report to ${reportPath}`);
}

if (require.main === module) main();
