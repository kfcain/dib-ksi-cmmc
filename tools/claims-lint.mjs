#!/usr/bin/env node
// Cross-check every countable claim in the prose against the registries.
//
// Why this exists. Every factual error this project has shipped had the same
// shape: a sentence somebody typed sitting next to a number the model computes,
// with nothing checking the two agree. "Eighteen measurements" when there were
// twenty-two. "36% inherited" when that figure was one class of four. "Nothing
// inherited" when the model said four. Each was individually obvious and none
// was caught, because the prose and the data were never compared.
//
// Adding one test per bug does not fix that. This does: any sentence claiming a
// quantity the registries know about is checked against the registries.
//
// Run: node tools/claims-lint.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

const catalog = rd('ontology/ksi-catalog.json');
const signals = rd('ontology/signals.json');
const collection = rd('ontology/collection.json');
const ontology = rd('ontology/dib-ksi-ontology.json');
const patterns = rd('ontology/responsibility-patterns.json');

// ── Ground truth, computed. Nothing below this line is typed by hand. ────────
const truth = {
  'KSIs|indicators': catalog.ksis.length,
  'measurements|signals': signals.signals.length,
  'collection methods|methods': collection.methods.length,
  'invariants|enforced rules': ontology.invariants.length,
  'criteria sources': collection.criteria_sources.sources.length,
  'evidence types|kinds of evidence': ontology.evidence_types.types.length,
  'deployment profiles|profiles': Object.keys(patterns.profiles).length,
  'families': new Set(catalog.ksis.map((k) => k.family)).size,
  'authority-bound|cite an authority': signals.signals.filter((s) => s.authority).length,
};

const WORDS = {
  five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, 'twenty-two': 22, 'twenty-three': 23,
  'sixty-four': 64, 'sixty-three': 63,
};
const num = (s) => (WORDS[s.toLowerCase()] ?? Number(s.replace(/,/g, '')));

// Every inheritance percentage the model can produce, so prose quoting one is
// checked against the set rather than against a single remembered figure.
const validPct = new Set();
const byKsi = Object.fromEntries(patterns.assignments.map((a) => [a.ksi, a]));
for (const profile of Object.keys(patterns.profiles)) {
  for (const cls of ['A', 'B', 'C', 'D']) {
    const inScope = catalog.ksis.filter((k) => {
      const s = (k.classes || {})[cls];
      return s && s !== 'n/a';
    });
    let off = 0;
    for (const k of inScope) {
      const m = byKsi[k.id]?.[profile] ?? 'tenant';
      if (m === 'inherited' || m === 'not_applicable') off++;
    }
    validPct.add(Math.round((off / inScope.length) * 100));
  }
}

// ── Scan ─────────────────────────────────────────────────────────────────────
const files = [];
const walk = (dir) => {
  for (const e of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const rel = join(dir, e.name);
    if (e.isDirectory()) walk(rel);
    else if (/\.(md|html)$/.test(e.name)) files.push(rel);
  }
};
walk('.');

const NUMWORD = Object.keys(WORDS).join('|');
const issues = [];

for (const file of files) {
  let text = readFileSync(resolve(root, file), 'utf8');
  // Strip generated data blocks and code so we only lint prose a human wrote.
  text = text.replace(/\/\*==DIB-DATA-START==[\s\S]*?==DIB-DATA-END==\*\//g, '')
             .replace(/<script[\s\S]*?<\/script>/g, '')
             .replace(/```[\s\S]*?```/g, '');
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    // A sentence discussing another publication is counting that publication's
    // things, not ours. NIST 800-171r3 really does have 17 families; saying so
    // is correct, and a linter that flags it will simply get switched off.
    const aboutSomeoneElse =
      /800-171|800-172|800-53|CR26|FedRAMP|CMMC|CIS |SCuBA|CFR|DFARS|Rev ?[23]|r[23]\b/i.test(line);

    for (const [nouns, expected] of Object.entries(truth)) {
      if (aboutSomeoneElse) continue;
      // Adjacent only. Allowing filler words between the number and the noun let
      // "twenty-two measurements cite an authority" parse as a claim about the
      // authority count. Simpler is also more precise here.
      const re = new RegExp(`\\b(${NUMWORD}|[0-9][0-9,]*)\\s+(${nouns})\\b`, 'gi');
      for (const m of line.matchAll(re)) {
        const claimed = num(m[1]);
        if (!Number.isFinite(claimed)) continue;
        if (claimed === expected) continue;

        // Only a claim about the WHOLE is checkable. Prose legitimately counts
        // subsets all the time — "twenty-three indicators that cannot be
        // automated" is correct and says nothing about the total. So flag only
        // when the sentence asserts totality ("the N X", "all N X") and does not
        // immediately qualify the noun with a restricting clause.
        const idx = m.index ?? 0;
        const before = line.slice(Math.max(0, idx - 16), idx).toLowerCase();
        const after = line.slice(idx + m[0].length, idx + m[0].length + 26).toLowerCase();

        const assertsTotal = /\b(all|the|our|its|these|only)\s+$/.test(before);
        const thenQualifies = /^\s*(that|which|needing|requiring|short|with|without|lacking|still|awaiting|in\s|from\s|for\s)/.test(after);
        const namesWholeNearby = new RegExp(`\\b${expected}\\b`)
          .test(line.toLowerCase().replace(m[0].toLowerCase(), ''));

        if (assertsTotal && !thenQualifies && !namesWholeNearby) {
          issues.push({ file, line: i + 1, found: m[0].trim(), expected,
                        why: claimed > expected ? `more ${m[2]} than exist`
                                                : `wrong total for ${m[2]}` });
        }
      }
    }

    // Inheritance percentages must be one the model can actually produce.
    for (const m of line.matchAll(/\b(\d{1,3})%\s*(?:of\s+)?(?:the\s+)?(?:control|catalog|catalogue|indicator)/gi)) {
      const p = Number(m[1]);
      if (!validPct.has(p)) {
        issues.push({ file, line: i + 1, found: m[0].trim(),
                      expected: [...validPct].sort((a, b) => a - b).join(', '),
                      why: 'not an inheritance figure the model produces' });
      }
    }
  });
}

if (issues.length) {
  console.error(`CLAIMS LINT: ${issues.length} issue(s)\n`);
  for (const x of issues) {
    console.error(`  ${x.file}:${x.line}  ${x.why}`);
    console.error(`    claimed "${x.found}"  ·  registry says ${x.expected}\n`);
  }
  process.exit(1);
}
console.log(`CLAIMS OK — ${files.length} files, ${Object.keys(truth).length} quantities cross-checked against the registries`);
