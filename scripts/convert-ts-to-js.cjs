const fs = require('fs');
const path = require('path');

const root = process.cwd();
const changed = [];

function walk(dir) {
  const dirPath = path.join(root, dir);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(path.join(dir, entry.name)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

function applyTransforms(content) {
  const replacements = [
    { regex: /export interface\s+\w+\s*\{[\s\S]*?\}\n/g, repl: '' },
    { regex: /export type\s+\w+\s*=\s*[^;]*;\n/g, repl: '' },
    { regex: /import\s+\{[^}]*\b(Product|Order|Review|User|Category|DashboardStats|ChartDataPoint|Coupon|BroadcastNotification|NewsletterSubscriber|ContactQuery|Message|Theme)\b[^}]*\}\s+from\s+['"]\.\.\/types['"];?\n/g, repl: '' },
    { regex: /import\s+\{\s*RootState\s*(,\s*AppDispatch\s*)?\}\s+from\s+['"]\.\.\/app\/store['"];?\n/g, repl: '' },
    { regex: /,?\s*CartStateItem\s*,?/g, repl: '' },
    { regex: /import\s+\{\s*\}\s+from\s+['"][^'"]+['"];?\n/g, repl: '' },
    { regex: /createContext<[^>]+>\(/g, repl: 'createContext(' },
    { regex: /useState<[^>]+>\(/g, repl: 'useState(' },
    { regex: /useMemo<[^>]+>\(/g, repl: 'useMemo(' },
    { regex: /useCallback<[^>]+>\(/g, repl: 'useCallback(' },
    { regex: /useReducer<[^>]+>\(/g, repl: 'useReducer(' },
    { regex: /useSelector<[^>]+>\(/g, repl: 'useSelector(' },
    { regex: /useDispatch<[^>]+>\(/g, repl: 'useDispatch(' },
    { regex: /React\.FC<[^>]+>/g, repl: 'React.FC' },
    { regex: /:\s*React\.ReactNode/g, repl: '' },
    { regex: /:\s*React\.FormEvent/g, repl: '' },
    { regex: /:\s*React\.FC/g, repl: '' },
    { regex: /<\s*[^>]+>\s*\(/g, repl: '(' },
    { regex: /\s+as\s+[A-Za-z0-9_\[\]\{\}\<\>'" ]+/g, repl: '' },
    { regex: /\)\s*:\s*[A-Za-z0-9_\[\]\{\}\<\>'"\|\s\?]+\s*=>/g, repl: ') =>' },
    { regex: /\)\s*:\s*[A-Za-z0-9_\[\]\{\}\<\>'"\|\s\?]+\s*\{/g, repl: ') {' },
    { regex: /(const|let|var)\s+([A-Za-z0-9_$]+)\s*:\s*[A-Za-z0-9_\[\]\{\}\<\>'"\|\s\?]+\s*(=)/g, repl: '$1 $2 $3' },
    { regex: /([,(]\s*[A-Za-z0-9_$]+)\s*:\s*(?!['"])[A-Za-z0-9_\[\]\{\}\<\>'"\|\s\?]+(?=\s*[=,)])/g, repl: '$1' },
    { regex: /catch \(.*\s*:\s*any\)/g, repl: match => match.replace(/\s*:\s*any/, '') },
    { regex: /location\.state\s+as\s+any/g, repl: 'location.state' },
  ];

  let result = content;
  for (const { regex, repl } of replacements) {
    result = result.replace(regex, repl);
  }
  return result;
}

for (const file of walk('src').concat(path.join(root, 'server.ts'))) {
  let content = fs.readFileSync(file, 'utf8');
  const transformed = applyTransforms(content);
  if (transformed !== content) {
    fs.writeFileSync(file, transformed, 'utf8');
    changed.push(file);
  }
}

const rename = (file, newExt) => {
  const newPath = file.replace(/\.[^.]+$/, newExt);
  fs.renameSync(file, newPath);
  changed.push(`${file} -> ${newPath}`);
};

for (const file of walk('src')) {
  if (file.endsWith('.tsx')) rename(file, '.jsx');
  else if (file.endsWith('.ts')) rename(file, '.js');
}

const serverFile = path.join(root, 'server.ts');
if (fs.existsSync(serverFile)) {
  rename(serverFile, '.js');
}

console.log('Converted files:', changed.length);
console.log(changed.join('\n'));
