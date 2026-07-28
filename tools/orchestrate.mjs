// orchestrate.mjs — work-queue projection for continuous evidence collection.
// Not a runtime scheduler and not a product. Collectors live outside this repo;
// this tool prints what the graph says is due so an external orchestrator (or an
// AI agent routing jobs) can emit conforming measurements and EvidenceRefs.
//
// Run:  node tools/orchestrate.mjs instances/ostrander-enclave.json
//       node tools/orchestrate.mjs instances/ostrander-enclave.json --json
import { load, derive } from './lib.mjs';

const path = process.argv[2];
const asJson = process.argv.includes('--json');
if (!path) {
  console.error('usage: node tools/orchestrate.mjs <instance.json> [--json]');
  process.exit(2);
}

const db = load(path);
const { sigs, claims } = derive(db);
const cls = db.instance.tenant.target_class;

const signalJobs = sigs
  .filter(s => s.applicable && (s.status === 'unmeasured' || s.status === 'stale' || s.status === 'breach'))
  .map(s => ({
    kind: 'collect_signal',
    signal: s.id,
    name: s.name,
    status: s.status,
    cadence_days: s.cadence_days,
    methods: db.signals.signals.find(x => x.id === s.id)?.methods || [],
    validates: s.validates,
  }));

const depthJobs = claims
  .filter(c => c.evidence_depth === 'short' || c.evidence_depth === 'unmeasured')
  .filter(c => c.status !== 'not_applicable' && c.status !== 'inherited')
  .map(c => ({
    kind: 'satisfy_evidence_floor',
    ksi: c.ksi,
    evidence_depth: c.evidence_depth,
    status: c.status,
    lane: c.required_floor.lane,
    missing_types: c.missing_types,
    present_types: c.present_types,
    method_shortfall: c.method_shortfall,
    // Lane hint for the orchestrator: E1 → collectors; E3 → bound-intent; E4/E5 → human/demo.
    suggested_actions: (c.missing_types || []).map(t => {
      if (t.startsWith('E1') || t.startsWith('methods')) return { evidence_type: 'E1', action: 'collect_independent_telemetry' };
      if (t === 'E3' || t === 'attestation') return { evidence_type: t === 'attestation' ? 'attestation' : 'E3', action: t === 'attestation' ? 'human_sign' : 'bind_intent_artifact' };
      if (t.startsWith('one_of')) return { evidence_type: 'E4|E5', action: 'schedule_observation_or_demonstration' };
      if (t === 'adversarial_E5') return { evidence_type: 'E5', action: 'schedule_adversarial_exercise' };
      if (t.startsWith('other')) return { evidence_type: 'E2-E5', action: 'add_non_e1_evidence' };
      return { evidence_type: t, action: 'add_evidence_ref' };
    }),
  }));

const lanes = {
  measured: claims.filter(c => c.signals.length && c.status !== 'inherited' && c.status !== 'not_applicable').length,
  inherited: claims.filter(c => c.status === 'inherited').length,
  determination_needed: claims.filter(c => c.status === 'determination_needed').length,
  depth_met: claims.filter(c => c.evidence_depth === 'met').length,
  depth_short: claims.filter(c => c.evidence_depth === 'short').length,
  depth_unmeasured: claims.filter(c => c.evidence_depth === 'unmeasured').length,
};

const out = {
  instance: db.instance.instance,
  as_of: db.instance.as_of,
  target_class: cls,
  target_level: db.instance.tenant.target_level,
  loop: [
    '1. Schedule collectors by signal cadence for target class',
    '2. Emit collection.json readings into measurements[]',
    '3. Store blobs at home; append evidence_refs[] with hash + supports',
    '4. node tools/validate.mjs <instance>',
    '5. node tools/project.mjs <instance> ksi',
    '6. Act on computed states only — never invent claim status or evidence_depth',
  ],
  lanes,
  due: { signals: signalJobs, evidence_floors: depthJobs },
};

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\nEvidence orchestration queue — ${out.instance} @ Class ${cls}`);
  console.log('─'.repeat(60));
  console.log('\nLoop:');
  for (const step of out.loop) console.log(`  ${step}`);
  console.log('\nLane tallies:');
  for (const [k, v] of Object.entries(lanes)) console.log(`  ${k.padEnd(22)} ${v}`);
  console.log(`\nDue signal jobs: ${signalJobs.length}`);
  for (const j of signalJobs.slice(0, 20)) {
    console.log(`  ${j.status.padEnd(11)} ${j.signal.padEnd(20)} methods=${j.methods.join(',') || '—'} → ${j.validates.join(', ')}`);
  }
  if (signalJobs.length > 20) console.log(`  … ${signalJobs.length - 20} more`);
  console.log(`\nDue evidence-floor jobs: ${depthJobs.length}`);
  for (const j of depthJobs.slice(0, 25)) {
    console.log(`  ${j.evidence_depth.padEnd(11)} ${j.ksi.padEnd(16)} missing=${j.missing_types.join(',') || '—'} (present=${j.present_types.join(',') || 'none'})`);
  }
  if (depthJobs.length > 25) console.log(`  … ${depthJobs.length - 25} more`);
  console.log('\nCollectors write facts. Derivation grades. AI agents may route jobs; they must not assert status or invent evidence.\n');
}
