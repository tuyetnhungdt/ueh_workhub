import fs from 'fs';
import path from 'path';

function walk(d) {
  let res = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') res = res.concat(walk(p));
    } else if (/\.jsx?$/.test(f)) {
      res.push(p);
    }
  }
  return res;
}

const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext'];
for (const file of walk('./src')) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const h of hooks) {
    const callRegex = new RegExp(`\\b${h}\\s*\\(`);
    if (callRegex.test(txt)) {
      const importRegex = new RegExp(`import\\s+[^;]*\\b${h}\\b[^;]*from\\s+['"]react['"]`);
      const reactDot = txt.includes(`React.${h}`);
      if (!importRegex.test(txt) && !reactDot) {
        console.log(`MISSING: ${h} in ${file}`);
      }
    }
  }
}
