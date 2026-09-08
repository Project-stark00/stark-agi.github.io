import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const baseUrl = 'https://project-stark00.github.io/stark-agi/';
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'data', 'articles.json'), 'utf8')).articles;
const template = fs.readFileSync(path.join(root, 'templates', 'research-article.html'), 'utf8');
const outputDirectory = path.join(root, 'research');

fs.mkdirSync(outputDirectory, { recursive: true });

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function stripMarkup(value) {
  return String(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '');
}

function slugify(value, used) {
  const base = stripMarkup(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'section';
  let result = base;
  let counter = 2;
  while (used.has(result)) {
    result = base + '-' + counter;
    counter += 1;
  }
  used.add(result);
  return result;
}

function relativeUrl(url) {
  if (/^(?:https?:|mailto:|#)/i.test(url)) return url;
  if (url.startsWith('../')) return url;
  return '../' + url.replace(/^\.\//, '');
}

function inline(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const href = relativeUrl(url);
    const external = /^https?:/i.test(href);
    return '<a href="' + escapeHtml(href) + '"' + (external ? ' target="_blank" rel="noreferrer"' : '') + '>' + label + '</a>';
  });
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return output;
}

function tableCells(line) {
  return line.replace(/^\s*\||\|\s*$/g, '').split('|').map((cell) => cell.trim());
}

function renderMarkdown(markdown, articleTitle) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const html = [];
  const headings = [];
  const usedIds = new Set();
  let paragraph = [];
  let listType = null;
  let code = null;
  let codeLanguage = '';
  let skippedTitle = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push('<p>' + inline(paragraph.join(' ')) + '</p>');
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push('</' + listType + '>');
    listType = null;
  };

  const openList = (type) => {
    if (listType === type) return;
    closeList();
    listType = type;
    html.push('<' + type + '>');
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      closeList();
      if (code === null) {
        code = [];
        codeLanguage = trimmed.slice(3).trim();
      } else {
        html.push('<pre><code' + (codeLanguage ? ' data-language="' + escapeHtml(codeLanguage) + '"' : '') + '>' + escapeHtml(code.join('\n')) + '</code></pre>');
        code = null;
        codeLanguage = '';
      }
      continue;
    }

    if (code !== null) {
      code.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const rawTitle = headingMatch[2].trim();
      if (!skippedTitle && headingMatch[1].length === 1 && stripMarkup(rawTitle) === stripMarkup(articleTitle)) {
        skippedTitle = true;
        continue;
      }
      const level = Math.max(2, headingMatch[1].length);
      const id = slugify(rawTitle, usedIds);
      html.push('<h' + level + ' id="' + id + '">' + inline(rawTitle) + '</h' + level + '>');
      if (level <= 3) headings.push({ level, id, title: stripMarkup(rawTitle) });
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push('<hr>');
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      closeList();
      html.push('<figure class="markdown-figure"><img src="' + escapeHtml(relativeUrl(imageMatch[2])) + '" alt="' + escapeHtml(imageMatch[1]) + '" loading="lazy"><figcaption>' + inline(imageMatch[1]) + '</figcaption></figure>');
      continue;
    }

    if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[index + 1])) {
      flushParagraph();
      closeList();
      const header = tableCells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;
      html.push('<div class="table-wrap"><table><thead><tr>' + header.map((cell) => '<th>' + inline(cell) + '</th>').join('') + '</tr></thead><tbody>' + rows.map((row) => '<tr>' + row.map((cell) => '<td>' + inline(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      openList('ol');
      html.push('<li>' + inline(orderedMatch[1]) + '</li>');
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      openList('ul');
      html.push('<li>' + inline(unorderedMatch[1]) + '</li>');
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      closeList();
      html.push('<blockquote>' + inline(quoteMatch[1]) + '</blockquote>');
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();

  const toc = '<ol>' + headings.map((heading) => '<li class="' + (heading.level === 3 ? 'toc-sub' : 'toc-main') + '"><a href="#' + heading.id + '">' + escapeHtml(heading.title) + '</a></li>').join('') + '</ol>';
  return { content: html.join('\n'), toc };
}

function stripFrontmatter(raw) {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function displayDate(value) {
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
}

function articleType(category) {
  return /Research|Technical/i.test(category) ? 'ScholarlyArticle' : 'Article';
}

function replaceAll(source, replacements) {
  return Object.entries(replacements).reduce((result, entry) => result.split('{{' + entry[0] + '}}').join(entry[1]), source);
}

catalogue.forEach((article, index) => {
  const raw = fs.readFileSync(path.join(root, article.file), 'utf8');
  const rendered = renderMarkdown(stripFrontmatter(raw), article.title);
  const canonical = baseUrl + 'research/' + article.slug + '.html';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': articleType(article.category),
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      '@id': baseUrl + '#jeremiah',
      name: 'Jeremiah Wong Zhi Qi',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      '@id': baseUrl + '#organization',
      name: 'STARK Digital',
      url: baseUrl
    },
    mainEntityOfPage: canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: 'STARK Digital',
      url: baseUrl
    },
    keywords: article.tags.join(', '),
    about: article.tags.map((tag) => ({ '@type': 'Thing', name: tag }))
  };
  const related = catalogue
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(index > 0 ? Math.max(0, index - 1) : 0, index > 0 ? Math.max(0, index - 1) + 2 : 2)
    .map((candidate) => '<a href="' + candidate.slug + '.html">' + escapeHtml(candidate.title) + ' <span aria-hidden="true">↗</span></a>')
    .join('');
  const pdfButton = article.download
    ? '<a class="button primary" href="../' + escapeHtml(article.download) + '">Download public PDF <span aria-hidden="true">↓</span></a>'
    : '<a class="button" href="https://github.com/Project-stark00/stark-agi" target="_blank" rel="noreferrer">View repository <span aria-hidden="true">↗</span></a>';

  const page = replaceAll(template, {
    META_TITLE: escapeHtml(article.title + ' | STARK Digital'),
    DESCRIPTION: escapeHtml(article.summary),
    CANONICAL: escapeHtml(canonical),
    TITLE: escapeHtml(article.title),
    JSON_LD: JSON.stringify(structuredData).replace(/<\//g, '<\\/'),
    DATE_ISO: escapeHtml(article.date),
    DATE_DISPLAY: escapeHtml(displayDate(article.date)),
    CATEGORY: escapeHtml(article.category),
    STATUS: escapeHtml(article.status),
    RESEARCH_CODE: 'R—' + String(index + 1).padStart(2, '0'),
    PDF_BUTTON: pdfButton,
    TOC: rendered.toc,
    CONTENT: rendered.content,
    RELATED: related
  });
  fs.writeFileSync(path.join(outputDirectory, article.slug + '.html'), page);
});

const sitemapEntries = [
  { url: baseUrl, lastmod: '2026-09-09', priority: '1.0' },
  { url: baseUrl + 'articles.html', lastmod: '2026-09-09', priority: '0.9' },
  { url: baseUrl + 'progress.html', lastmod: '2026-09-09', priority: '0.8' },
  ...catalogue.map((article) => ({ url: baseUrl + 'research/' + article.slug + '.html', lastmod: article.date, priority: article.slug.includes('m8') ? '0.9' : '0.7' }))
];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapEntries.map((entry) => '  <url><loc>' + entry.url + '</loc><lastmod>' + entry.lastmod + '</lastmod><changefreq>monthly</changefreq><priority>' + entry.priority + '</priority></url>').join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + baseUrl + 'sitemap.xml\n');

function publicFiles(directory) {
  const excludedDirectories = new Set(['.git', '.openai', 'node_modules', 'templates', 'scripts']);
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'DEPLOYMENT_MANIFEST.json') continue;
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...publicFiles(absolute));
    if (entry.isFile()) files.push(absolute);
  }
  return files;
}

const manifestFiles = publicFiles(root)
  .map((absolute) => {
    const buffer = fs.readFileSync(absolute);
    return {
      path: path.relative(root, absolute).split(path.sep).join('/'),
      bytes: buffer.length,
      sha256: crypto.createHash('sha256').update(buffer).digest('hex')
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const manifest = {
  format: 'stark-digital-static-deployment-manifest-v4',
  generated: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
  milestone: 'M8 complete; STARK Digital portfolio and crawlable research edition',
  file_count: manifestFiles.length,
  files: manifestFiles
};
fs.writeFileSync(path.join(root, 'DEPLOYMENT_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log('Built ' + catalogue.length + ' research pages, sitemap, robots.txt, and deployment manifest.');
