// Build an EPUB3 file from the course content. Uses our minimal stored-ZIP
// encoder; no jszip dependency. Output is a real .epub that opens in Kindle
// Previewer, Apple Books, iBooks, Calibre, etc.

import { CONCEPTS, MODULES } from './data.js';
import { FLESHED } from './fleshed.js';
import { buildZip } from './zip.js';
import { announce } from './runtime.js';

function escapeXml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fleshedToHtml(piece) {
  if (typeof piece === 'string') return '<p>' + escapeXml(piece) + '</p>';
  if (Array.isArray(piece)) return piece.map(fleshedToHtml).join('\n');
  if (piece && typeof piece === 'object' && typeof piece.code === 'string') {
    return '<pre><code>' + escapeXml(piece.code) + '</code></pre>';
  }
  return '';
}

function buildChapter(modN, m, concepts) {
  let html = '<?xml version="1.0" encoding="UTF-8"?>\n';
  html += '<!DOCTYPE html>\n';
  html += '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n';
  html += '<head><title>Module ' + modN + ': ' + escapeXml(m.title) + '</title>';
  html += '<link rel="stylesheet" type="text/css" href="../styles.css"/></head>\n';
  html += '<body>\n';
  html += '<h1 id="m' + modN + '">Module ' + modN + ': ' + escapeXml(m.title) + '</h1>\n';
  html += '<p class="intro"><em>' + escapeXml(m.intro) + '</em></p>\n';
  for (const c of concepts) {
    html += '<section class="concept">\n';
    html += '<h2 id="' + escapeXml(c.slug) + '">' + escapeXml(c.name) + '</h2>\n';
    if (c.aliases && c.aliases.length) {
      html += '<p class="aliases"><em>Also: ' + escapeXml(c.aliases.join(', ')) + '</em></p>\n';
    }
    html += '<p><strong>Definition.</strong> ' + escapeXml(c.stub) + '</p>\n';
    const f = FLESHED && FLESHED[c.slug];
    if (f) {
      if (f.opener) { html += '<h3>What it actually is</h3>\n' + fleshedToHtml(f.opener) + '\n'; }
      if (f.breakdown) { html += '<h3>Architectural breakdown</h3>\n' + fleshedToHtml(f.breakdown) + '\n'; }
      if (f.example) { html += '<h3>Worked example</h3>\n' + fleshedToHtml(f.example) + '\n'; }
      if (f.failures) {
        html += '<h3>Common failures</h3>\n<ul>\n';
        const arr = Array.isArray(f.failures) ? f.failures : [f.failures];
        for (const item of arr) html += '<li>' + escapeXml(typeof item === 'string' ? item : '') + '</li>\n';
        html += '</ul>\n';
      }
    }
    html += '</section>\n';
  }
  html += '</body></html>';
  return html;
}

const STYLE_CSS = `body { font-family: Georgia, serif; line-height: 1.6; max-width: 36em; margin: 1em auto; padding: 0 1em; color: #111; }
h1 { font-size: 1.7em; margin-top: 1.5em; page-break-before: always; }
h2 { font-size: 1.3em; margin-top: 1.5em; border-top: 1px solid #ccc; padding-top: 0.5em; }
h3 { font-size: 1.05em; margin-top: 1em; color: #555; }
.intro, .aliases { color: #555; }
pre { background: #f4f4f4; padding: 0.8em; overflow-x: auto; font-size: 0.85em; border-radius: 4px; }
code { font-family: Menlo, Consolas, monospace; }
section.concept { margin-bottom: 2em; }
ul { padding-left: 1.4em; }
`;

const CONTAINER_XML = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

function buildOpf(uid, title, chapters) {
  let manifest = '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n';
  manifest += '<item id="css" href="styles.css" media-type="text/css"/>\n';
  let spine = '<itemref idref="nav"/>\n';
  for (const c of chapters) {
    manifest += '<item id="' + c.id + '" href="' + c.href + '" media-type="application/xhtml+xml"/>\n';
    spine += '<itemref idref="' + c.id + '"/>\n';
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>AISE 2026</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>${manifest}</manifest>
  <spine>${spine}</spine>
</package>`;
}

function buildNav(chapters) {
  let lis = '';
  for (const c of chapters) {
    lis += '<li><a href="' + c.href + '">' + escapeXml(c.title) + '</a></li>\n';
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body>
<nav epub:type="toc">
<h1>Table of contents</h1>
<ol>${lis}</ol>
</nav>
</body></html>`;
}

/**
 * Build the full course as an EPUB Blob.
 */
export function buildEpub() {
  const uid = 'aise26-course-' + new Date().toISOString().slice(0, 10);
  const chapters = MODULES.map(m => ({
    id: 'm' + m.n,
    href: 'OEBPS/m' + m.n + '.xhtml',
    title: 'Module ' + m.n + ': ' + m.title,
    content: buildChapter(m.n, m, CONCEPTS.filter(c => c.module === m.n))
  }));

  // Chapter hrefs in manifest are relative to content.opf which lives in OEBPS/.
  const chaptersForOpf = chapters.map(c => ({
    id: c.id,
    href: c.href.replace(/^OEBPS\//, ''),
    title: c.title
  }));

  const entries = [
    // mimetype MUST be the first entry, stored, no extra
    { name: 'mimetype', data: 'application/epub+zip' },
    { name: 'META-INF/container.xml', data: CONTAINER_XML },
    { name: 'OEBPS/styles.css', data: STYLE_CSS },
    { name: 'OEBPS/content.opf', data: buildOpf(uid, 'AI Solutions Engineer / Architect 2026', chaptersForOpf) },
    { name: 'OEBPS/nav.xhtml', data: buildNav(chaptersForOpf) }
  ];
  for (const c of chapters) entries.push({ name: c.href, data: c.content });

  return buildZip(entries);
}

/**
 * Trigger a browser download of the EPUB file.
 */
export function downloadEpub() {
  const blob = buildEpub();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aise26-course-' + new Date().toISOString().slice(0, 10) + '.epub';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  announce('EPUB download started.');
}

window.aise26 = Object.assign(window.aise26 || {}, { exportEpub: { buildEpub, downloadEpub } });
