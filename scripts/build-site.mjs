import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.resolve(root, 'out');

if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'out') {
  throw new Error('Refusing to prepare static output outside the project out directory.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const files = ['index.html', 'articles.html', 'progress.html', 'sitemap.xml', 'robots.txt'];
const directories = ['assets', 'css', 'data', 'js', 'research'];

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

console.log('Prepared static site output in out/.');
