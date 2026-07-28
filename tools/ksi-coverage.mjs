// ksi-coverage.mjs — report which KSIs have signal coverage and which automatable
// KSIs still lack a SIG-*. New signals are proposed only after the collect→derive→
// project loop is trustworthy; this tool lists the gap without inventing indicators.
//
// Run: node tools/ksi-coverage.mjs
import { load } from './lib.mjs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const db = load(join(ROOT, 'instances', 'ostrander-enclave.json'));
const covered = new Set();
for (const s of db.signals.signals) for (const k of s.validates || []) covered.add(k);

const auto = db.catalog.ksis.filter(k => k.automatable);
const non = db.catalog.ksis.filter(k => !k.automatable);
const uncoveredAuto = auto.filter(k => !covered.has(k.id));
const uncoveredNon = non.filter(k => !covered.has(k.id));

console.log('KSI signal coverage');
console.log('─'.repeat(40));
console.log(`Signals:              ${db.signals.signals.length}`);
console.log(`KSIs covered:         ${covered.size} / ${db.catalog.ksis.length}`);
console.log(`Automatable covered:  ${auto.filter(k => covered.has(k.id)).length} / ${auto.length}`);
console.log(`Non-automatable covered (via demo/observation signals): ${non.filter(k => covered.has(k.id)).length} / ${non.length}`);
console.log('\nThree lanes for full-catalog continuous monitoring:');
console.log('  1. Measured — run collectors for existing SIG-*; extend SIG-* only after the loop is trustworthy');
console.log('  2. Inherited — provider validation feed + three-test + SIG-INHERIT-FRESH');
console.log('  3. Floor evidence — E2/E3/E4/E5 EvidenceRefs even when the threshold bar is green');
console.log('\nUncovered automatable KSIs (determination_needed until a signal or inheritance covers them):');
for (const k of uncoveredAuto) console.log(`  ${k.id.padEnd(16)} ${k.name}`);
console.log(`\nUncovered non-automatable KSIs (need E4/E5 or physical-lane EvidenceRefs, not new telemetry signals):`);
for (const k of uncoveredNon) console.log(`  ${k.id.padEnd(16)} ${k.name}`);
console.log('\nDo not invent SIG-* here to force coverage. Propose registry changes with authority, methods, thresholds, cadence, and a negative test — then regenerate and run ./tools/ci.sh.\n');
