import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteRoot = path.resolve(root, process.argv[2] || '.');
const issues = [];

function walk(directory, extension) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', '.openai', 'node_modules', 'templates', 'out'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(absolute, extension));
    if (entry.isFile() && entry.name.endsWith(extension)) results.push(absolute);
  }
  return results;
}

function relative(file) {
  return path.relative(siteRoot, file).split(path.sep).join('/');
}

function check(condition, message) {
  if (!condition) issues.push(message);
}

const htmlFiles = walk(siteRoot, '.html');
const canonicalUrls = new Set();

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const name = relative(file);
  const titles = source.match(/<title>[\s\S]*?<\/title>/gi) || [];
  const headings = source.match(/<h1(?:\s[^>]*)?>/gi) || [];
  const descriptions = source.match(/<meta\s+name="description"\s+content="[^"]+">/gi) || [];
  const canonicalMatch = source.match(/<link\s+rel="canonical"\s+href="([^"]+)">/i);
  const ids = [...source.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
  const images = [...source.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);

  check(titles.length === 1, name + ': expected one title');
  check(headings.length === 1, name + ': expected one h1, found ' + headings.length);
  check(descriptions.length === 1, name + ': expected one meta description');
  check(Boolean(canonicalMatch), name + ': missing canonical URL');
  check(ids.length === new Set(ids).size, name + ': duplicate element id');
  check(!/\{\{[A-Z_]+\}\}/.test(source), name + ': unresolved template placeholder');
  images.forEach((image, index) => check(/\salt="[^"]*"/i.test(image), name + ': image ' + (index + 1) + ' has no alt text'));

  if (canonicalMatch) {
    check(!canonicalUrls.has(canonicalMatch[1]), name + ': duplicate canonical URL');
    canonicalUrls.add(canonicalMatch[1]);
  }

  const jsonLdBlocks = [...source.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  check(jsonLdBlocks.length > 0, name + ': missing JSON-LD');
  for (const block of jsonLdBlocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      issues.push(name + ': invalid JSON-LD: ' + error.message);
    }
  }

  const references = [...source.matchAll(/\s(?:href|src)="([^"]+)"/gi)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    const clean = reference.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), decodeURIComponent(clean));
    check(fs.existsSync(target), name + ': missing local reference ' + reference);
  }
}

const catalogue = JSON.parse(fs.readFileSync(path.join(siteRoot, 'data', 'articles.json'), 'utf8')).articles;
for (const article of catalogue) {
  check(fs.existsSync(path.join(siteRoot, 'research', article.slug + '.html')), 'missing generated research page for ' + article.slug);
  if (siteRoot === root) check(fs.existsSync(path.join(siteRoot, article.file)), 'missing Markdown source for ' + article.slug);
}

JSON.parse(fs.readFileSync(path.join(siteRoot, 'data', 'progress.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(siteRoot, 'sitemap.xml'), 'utf8');
for (const canonical of canonicalUrls) {
  check(sitemap.includes('<loc>' + canonical + '</loc>'), 'sitemap missing canonical ' + canonical);
}

if (issues.length) {
  console.error('Site validation failed with ' + issues.length + ' issue(s):');
  issues.forEach((issue) => console.error('- ' + issue));
  process.exit(1);
}

console.log('Validated ' + htmlFiles.length + ' HTML pages, ' + canonicalUrls.size + ' canonical URLs, all local references, JSON-LD blocks, and research catalogue entries.');
