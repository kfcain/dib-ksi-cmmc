// prose-lint.mjs — catches the machine-generated tells this project has shipped before, so they
// cannot creep back in. Scans every Markdown file in the repository, and every string value in
// the ontology registries — registry prose renders on the site and is held to the same bar.
// Run: node tools/prose-lint.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Each rule is [pattern, why]. Keep this list tight and truthful — a linter that cries wolf
// gets ignored, and then it is worse than not having one.
const BANNED = [
  [/\bthat['’]?s the whole\b/i,            "\"that's the whole …\" — name the thing instead"],
  [/\bthe (?:whole|entire) (?:idea|design|point|story|thesis|reason|deal)\b/i,
                                            "rhetorical intensifier — cut it"],
  [/\baren['’]?t magic\b/i,                "\"… aren't magic\""],
  [/\bhere['’]?s the (?:through-line|thing|deal|kicker|catch|rub)\b/i, "filler opener"],
  [/\bthe sharpest question\b/i,           "filler opener"],
  [/\bno [\w-]+(?: [\w-]+){0,2}, no [\w-]+/i, "\"no X, no Y\" chain — write it as prose"],
  [/\bat the end of the day\b/i,           "filler"],
  [/\bin today['’]?s (?:world|landscape|environment|climate)\b/i, "filler"],
  [/\bneedless to say\b/i,                 "filler"],
  [/\bit['’]?s worth noting that\b/i,      "filler"],
  [/\bnavigate(?:s|d)? the (?:complex |ever-changing |modern )?landscape\b/i, "cliché"],
  [/\b(?:delve|delving|delves) into\b/i,   "machine lexicon"],
  [/\btapestry\b/i,                        "machine lexicon"],
  [/\ba testament to\b/i,                  "machine lexicon"],
  [/\bseamless(?:ly)?\b/i,                 "puffery"],
  [/\bleverage(?:s|d)? (?:the |our |its )?(?:power|synergy|capabilit)/i, "puffery"],
];

// More than two em-dashes in one paragraph is a cadence tell rather than punctuation.
const EMDASH_MAX = 2;

function markdownFiles(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '.git' || e === 'node_modules') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) markdownFiles(p, out);
    else if (e.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = markdownFiles(ROOT);
const hits = [];

for (const file of files) {
  const name = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  let fenced = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (/^\s*#/.test(lines[i])) continue;                     // headings are labels, not prose
    const scan = lines[i].replace(/`[^`]*`/g, '');            // ignore inline code
    for (const [re, why] of BANNED) {
      if (re.test(scan)) hits.push({ name, line: i + 1, why, ctx: lines[i].trim().slice(0, 100) });
    }
  }

  // Em-dash density is measured per running paragraph. Table rows and list items are excluded:
  // one dash per row or bullet is formatting, not the cadence tell this rule exists to catch.
  const prose = text.replace(/```[\s\S]*?```/g, '');
  for (const block of prose.split(/\n\s*\n/)) {
    const running = block.split('\n')
      .filter(l => !/^\s*\|/.test(l) && !/^\s*[-*+]\s/.test(l) && !/^\s*\d+\.\s/.test(l) && !/^\s*#/.test(l))
      .join('\n');
    const n = (running.match(/—/g) || []).length;
    if (n > EMDASH_MAX) {
      hits.push({ name, line: 0, why: `${n} em-dashes in one paragraph (max ${EMDASH_MAX})`, ctx: running.trim().slice(0, 100) });
    }
  }
}

// Registry JSON: apply the banned list to every string value. The em-dash density rule stays
// Markdown-only — registry strings are single sentences, not paragraphs.
const jsonFiles = readdirSync(join(ROOT, 'ontology')).filter(f => f.endsWith('.json'));
for (const f of jsonFiles) {
  const name = join('ontology', f);
  const walk = (node, path) => {
    if (typeof node === 'string') {
      for (const [re, why] of BANNED) {
        if (re.test(node)) hits.push({ name: `${name} (${path})`, line: 0, why, ctx: node.slice(0, 100) });
      }
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(JSON.parse(readFileSync(join(ROOT, name), 'utf8')), '');
}

if (hits.length) {
  console.error(`PROSE LINT: ${hits.length} issue(s)\n`);
  for (const h of hits) console.error(`  ${h.name}${h.line ? ':' + h.line : ''}  [${h.why}]\n    "${h.ctx}"`);
  process.exit(1);
}
console.log(`PROSE OK — ${files.length} Markdown files + ${jsonFiles.length} registries, 0 issues`);
