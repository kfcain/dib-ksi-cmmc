// gen-consolidated.mjs — build the single canonical dataset from the source registries.
// One file to consume, five files to maintain. The consolidated dataset is GENERATED: it is
// never hand-edited, and CI fails if it drifts from the registries it was built from.
// Run:  node tools/gen-consolidated.mjs            (writes dib-ksi-consolidated.json)
//       node tools/gen-consolidated.mjs --check    (exits 1 if the committed file is stale)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const rd = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const sha = s => createHash('sha256').update(s).digest('hex');

const SOURCES = {
  ontology: 'ontology/dib-ksi-ontology.json',
  signals: 'ontology/signals.json',
  responsibility_patterns: 'ontology/responsibility-patterns.json',
  poam_policy: 'ontology/poam-policy.json',
  catalog: 'ontology/ksi-catalog.json',
  collection: 'ontology/collection.json',
  guidance: 'ontology/guidance.json',
};

const parts = Object.fromEntries(Object.entries(SOURCES).map(([k, p]) => [k, rd(p)]));

const consolidated = {
  title: 'DIB-KSI Consolidated Dataset',
  version: parts.ontology.version,
  released: parts.ontology.date,
  status: 'working draft, published for adversarial comment',
  generated_by: 'tools/gen-consolidated.mjs',
  generated_note: 'Generated from the source registries. Do not hand-edit; edit the sources and regenerate.',

  identifies: {
    ontology_version: parts.ontology.version,
    signals_version: parts.signals.version,
    responsibility_patterns_version: parts.patterns?.version ?? parts.responsibility_patterns.version,
    poam_policy_version: parts.poam_policy.version,
    catalog_version: parts.catalog.version,
  },

  counts: {
    ksis: parts.catalog.ksis.length,
    ksi_families: new Set(parts.catalog.ksis.map(k => k.family)).size,
    automatable_ksis: parts.catalog.ksis.filter(k => k.automatable).length,
    non_automatable_ksis: parts.catalog.ksis.filter(k => !k.automatable).length,
    indicators: parts.signals.signals.length,
    indicators_authority_bound: parts.signals.signals.filter(s => s.authority).length,
    indicators_local_policy: parts.signals.signals.filter(s => s.derived === 'local-policy').length,
    collection_methods: parts.collection.methods.length,
    guidance_written: Object.keys(parts.guidance.guidance).length,
    entity_types: Object.keys(parts.ontology.entities).length,
    relations: parts.ontology.relations.length,
    invariants: parts.ontology.invariants.length,
    projections: parts.ontology.projections.length,
    responsibility_assignments: parts.responsibility_patterns.assignments.length,
    deployment_profiles: Object.keys(parts.responsibility_patterns.profiles).length,
  },

  sources: Object.fromEntries(
    Object.entries(SOURCES).map(([k, p]) => [k, { path: p, sha256: sha(readFileSync(join(ROOT, p), 'utf8')) }])
  ),

  data: parts,
};

const out = JSON.stringify(consolidated, null, 2) + '\n';
const target = join(ROOT, 'dib-ksi-consolidated.json');

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(target, 'utf8'); } catch { /* missing */ }
  if (current !== out) {
    console.error('STALE: dib-ksi-consolidated.json does not match the source registries.');
    console.error('Run: node tools/gen-consolidated.mjs');
    process.exit(1);
  }
  console.log('IN SYNC — dib-ksi-consolidated.json matches the source registries.');
} else {
  writeFileSync(target, out);
  const c = consolidated.counts;
  console.log(`built dib-ksi-consolidated.json v${consolidated.version} — ` +
    `${c.ksis} KSIs / ${c.ksi_families} families, ${c.indicators} indicators, ` +
    `${c.entity_types} entity types, ${c.invariants} invariants, ${c.responsibility_assignments} assignments`);
}
