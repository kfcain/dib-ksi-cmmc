// project.mjs — every deliverable, computed as a query over the instance graph.
// Nothing here is stored anywhere; run it twice and you get the same answer because the graph,
// not a document, is the source. That is INV-PROJECTION.
// Run: node tools/project.mjs instances/ostrander-enclave.json [crm|posture|poam|access|inherit|sdr|signals|ksi|all]
import { load, derive } from './lib.mjs';

const path = process.argv[2];
const which = (process.argv[3] || 'all').toLowerCase();
if (!path) {
  console.error('usage: node tools/project.mjs <instance.json> [crm|posture|poam|access|inherit|sdr|signals|ksi|all]');
  process.exit(2);
}

const db = load(path);
const { resp, sigs, claims, findings, exceptions } = derive(db);
const T = db.instance.tenant;
const bar = (n, w = 28) => '█'.repeat(Math.round(n * w)) + '·'.repeat(w - Math.round(n * w));
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
const head = s => console.log(`\n\x1b[1m${s}\x1b[0m\n${'─'.repeat(s.length)}`);

// ── PRJ-CRM: responsibility matrix ────────────────────────────────────────────
function crm() {
  head(`PRJ-CRM  Responsibility matrix — ${db.patterns.profiles[T.enclave_profile].name}`);
  const tally = {};
  for (const r of resp) tally[r.mode] = (tally[r.mode] || 0) + 1;
  const order = ['inherited', 'not_applicable', 'shared', 'tenant'];
  for (const m of order) {
    if (!tally[m]) continue;
    console.log(`  ${m.padEnd(16)} ${String(tally[m]).padStart(2)}/64  ${bar(tally[m] / 64)}  ${pct(tally[m], 64)}%`);
  }
  const off = (tally.inherited || 0) + (tally.not_applicable || 0);
  console.log(`\n  Fully off the tenant: ${off}/64 (${pct(off, 64)}%).  Tenant-only: ${tally.tenant || 0}.  Shared: ${tally.shared || 0}.`);
  const byFam = {};
  for (const r of resp) { const f = r.ksi.split('-')[1]; (byFam[f] ||= []).push(r.mode[0].toUpperCase()); }
  console.log('\n  By family (I=inherited S=shared T=tenant N=n/a):');
  for (const [f, v] of Object.entries(byFam)) console.log(`    ${f.padEnd(5)} ${v.join(' ')}`);
}

// ── PRJ-INHERIT: inherited-versus-owned split with the three-test result ──────
function inherit() {
  head('PRJ-INHERIT  Inheritance validity');
  const enc = db.instance.enclaves?.[0];
  console.log(`  Provider: ${enc?.id} — ${enc?.authorization.program} ${enc?.authorization.level} / ${enc?.authorization.il}, sustains Class ${enc?.assurance_class}`);
  const tests = resp.find(r => r.tests)?.tests || [];
  for (const t of tests) console.log(`  ${t.pass ? 'PASS' : 'FAIL'}  ${t.id.padEnd(16)} ${t.detail}`);
  const degraded = resp.filter(r => r.degraded_from);
  console.log(`\n  Degraded assignments: ${degraded.length}`);
  for (const d of degraded.slice(0, 8)) console.log(`    ${d.ksi} inherited → ${d.mode}`);
  const feed = sigs.find(s => s.id === 'SIG-INHERIT-FRESH');
  console.log(`\n  Feed freshness: ${feed?.value}d against a ${feed?.cadence_days}d window — ${feed?.status}`);
  console.log('  If the feed stops, every inherited claim ages together and reports stale rather than silent.');
}

// ── PRJ-SIGNALS: the unit of assurance ───────────────────────────────────────
function signals() {
  head(`PRJ-SIGNALS  Measured posture at Class ${T.target_class}`);
  const w = Math.max(...sigs.map(s => s.name.length));
  for (const s of sigs) {
    const mark = { pass: 'PASS', breach: 'BREACH', stale: 'STALE', unmeasured: 'UNMEASURED', not_applicable: 'n/a' }[s.status];
    const src = s.authority ? s.authority : (s.derived === 'local-policy' ? 'local policy' : '—');
    let b;
    if (s.kind === 'coverage') {
      const n = (s.unjustified || []).length;
      b = n ? `${n} uncovered: ${s.unjustified.join(', ')}` : 'all covered';
    } else if (s.kind === 'range') {
      b = `${s.value} within ${s.range?.min}-${s.range?.max}`;
    } else {
      b = `${s.value}${s.unit === 'days' ? 'd' : s.unit === 'hours' ? 'h' : ''} vs ${s.threshold ?? 'n/a'}`;
    }
    console.log(`  ${mark.padEnd(11)} ${s.name.padEnd(w)}  ${b.padEnd(46)} ${String(src).padEnd(22)} age ${s.measured ? s.age_days + 'd' : '—'}`);
  }
  const graded = sigs.filter(s => s.applicable && s.measured);
  console.log(`\n  ${graded.filter(s => s.status === 'pass').length}/${graded.length} measured indicators pass at Class ${T.target_class}.`);
}

// ── PRJ-POSTURE: class and level, computed not claimed ───────────────────────
function posture() {
  head('PRJ-POSTURE  Computed class and level');
  const applicable = claims.filter(c => c.status !== 'not_applicable');
  const t = {};
  for (const c of applicable) t[c.status] = (t[c.status] || 0) + 1;
  for (const [k, v] of Object.entries(t)) console.log(`  ${k.padEnd(20)} ${String(v).padStart(2)}  ${bar(v / applicable.length)}`);
  const blocking = applicable.filter(c => c.status === 'not_met' || c.status === 'stale');
  const short = claims.filter(c => c.method_shortfall > 0);
  const depth = {};
  for (const c of applicable) depth[c.evidence_depth] = (depth[c.evidence_depth] || 0) + 1;
  console.log('\n  Evidence depth (class floors):');
  for (const [k, v] of Object.entries(depth)) console.log(`  ${k.padEnd(20)} ${String(v).padStart(2)}  ${bar(v / applicable.length)}`);
  const depthShort = applicable.filter(c => c.evidence_depth === 'short');
  console.log(`\n  Applicable KSIs at ${T.target_level}: ${applicable.length}`);
  console.log(`  Blocking (not met or stale): ${blocking.length}${blocking.length ? ' — ' + blocking.map(c => c.ksi).join(', ') : ''}`);
  console.log(`  Short of independent automated methods: ${short.length}`);
  console.log(`  Short of class evidence-type floor: ${depthShort.length}${depthShort.length ? ' — ' + depthShort.slice(0, 12).map(c => c.ksi).join(', ') + (depthShort.length > 12 ? ', …' : '') : ''}`);
  console.log(`\n  Statement: ${T.target_level} @ Class ${T.current_class} today. The delta to Class ${T.target_class} is ${blocking.length} failing or stale KSI(s), ${short.length} KSI(s) needing independent methods, and ${depthShort.length} KSI(s) short of evidence depth.`);
  console.log('  Class is computed from evidence depth, cadence, and history — it is never asserted by the tenant.');
}

// ── PRJ-KSI: per-KSI status vs persistent evidence and class floors ───────────
function ksi() {
  head(`PRJ-KSI  Per-KSI evidence status at Class ${T.target_class}`);
  const show = claims.filter(c => c.status !== 'not_applicable');
  for (const c of show) {
    const floorBits = [];
    if (c.required_floor.min_e1_methods) {
      floorBits.push(`E1×${c.required_floor.min_e1_methods}${c.required_floor.independent_control_planes ? ' independent' : ''}`);
    }
    if (c.required_floor.min_methods) floorBits.push(`methods×${c.required_floor.min_methods}`);
    if (c.required_floor.required_types?.length) floorBits.push(c.required_floor.required_types.join('+'));
    if (c.required_floor.require_other_type) floorBits.push('+other');
    for (const g of c.required_floor.require_one_of || []) floorBits.push(`one_of(${g.join('|')})`);
    if (c.required_floor.require_adversarial_e5) floorBits.push('adversarial_E5');
    if (c.required_floor.require_attestation) floorBits.push('attestation');

    const sigDetail = c.signals.map(id => {
      const s = sigs.find(x => x.id === id);
      return s ? `${id}=${s.status}` : id;
    }).join(' ') || '—';

    console.log(`  ${c.ksi}  required@${T.target_class}  status=${c.status}  depth=${c.evidence_depth}  lane=${c.required_floor.lane}`);
    console.log(`    floor: ${floorBits.join(' + ') || '—'}`);
    console.log(`    present: ${(c.present_types || []).join(', ') || 'none'}  missing: ${(c.missing_types || []).join(', ') || '—'}`);
    console.log(`    signals: ${sigDetail}`);
    console.log(`    support: ${(c.support || []).join(', ') || '—'}  e1_planes=${c.e1_methods || 0}  methods=${(c.methods || []).join(',') || '—'}`);
    if (c.third_party_e2_preferred && !c.third_party_e2_present)
      console.log('    note: Class prefers third-party-originated E2 where one exists');
  }
  const met = show.filter(c => c.evidence_depth === 'met').length;
  const shortN = show.filter(c => c.evidence_depth === 'short').length;
  const unm = show.filter(c => c.evidence_depth === 'unmeasured').length;
  console.log(`\n  ${show.length} applicable KSIs — depth met:${met} short:${shortN} unmeasured:${unm} inherited:${show.filter(c => c.evidence_depth === 'inherited').length}`);
  console.log('  Status is signal-driven; evidence_depth is the class floor. A green bar with depth=short is not class-complete proof.');
}

// ── PRJ-POAM: exception queue with requirement-level eligibility ──────────────
function poam() {
  head('PRJ-POAM  Finding queue and exception eligibility');
  if (!findings.length) { console.log('  No open findings.'); return; }
  for (const f of findings) {
    const ex = exceptions.find(e => e.finding === f.id);
    const elig = ex ? (ex.eligible ? `eligible (${ex.window_days}d)` : `INELIGIBLE — blocked by ${ex.blocked_by.join(', ')}`) : 'no mapped requirement';
    console.log(`  ${f.id}  ${f.kind.padEnd(20)} ${f.subject.padEnd(20)} ${elig}`);
    console.log(`         ${f.detail}`);
  }
  console.log(`\n  ${findings.length} finding(s). Eligibility binds at the requirement level; the engine decides it, not a narrative.`);
  console.log(`  Policy status: ${db.poam.status}`);
}

// ── PRJ-ACCESS: who has access, on what basis, reviewed when ─────────────────
function access() {
  head('PRJ-ACCESS  Access review');
  const byAsset = {};
  for (const a of db.instance.access_grants || []) (byAsset[a.data_asset] ||= []).push(a);
  for (const [asset, grants] of Object.entries(byAsset)) {
    const da = db.instance.data_assets.find(d => d.id === asset);
    console.log(`  ${asset}  [${da.data_type}]  ${da.name}`);
    console.log(`         necessity: ${da.necessity?.basis ?? 'NONE RECORDED'} (reviewed ${da.necessity?.reviewed_on ?? '—'})`);
    for (const g of grants) {
      const p = db.instance.persons.find(x => x.id === g.person);
      console.log(`         ${g.privilege.padEnd(6)} ${p.name.padEnd(34)} mfa=${g.mfa.padEnd(19)} reviewed ${g.last_reviewed}`);
    }
  }
  console.log('\n  Every CUI asset carries a necessity record and every grant a stated basis, or the validator opens a finding.');
}

// ── PRJ-SDR: the Security Decision Record, as a projection ───────────────────
function sdr() {
  head('PRJ-SDR  Security Decision Record (projection)');
  console.log(`  ${db.instance.instance} — ${T.target_level} @ Class ${T.current_class}, targeting Class ${T.target_class}`);
  console.log(`  Profile: ${db.patterns.profiles[T.enclave_profile].name}`);
  console.log(`  As of:   ${db.instance.as_of}`);
  console.log(`\n  Components in scope:`);
  for (const c of db.instance.components) {
    const where = c.hosted_in ? `hosted in ${c.hosted_in}` : `boundary ${c.boundary}`;
    console.log(`    ${c.id.padEnd(14)} ${c.asset_category.padEnd(12)} ${where.padEnd(22)} ${c.name}`);
  }
  console.log(`\n  Per-family claim status (objective-level status is retained beneath each):`);
  const byFam = {};
  for (const c of claims) {
    (byFam[c.family] ||= { met: 0, inherited: 0, not_met: 0, stale: 0, determination_needed: 0, not_applicable: 0 })[c.status]++;
  }
  for (const [f, v] of Object.entries(byFam)) {
    const parts = Object.entries(v).filter(([, n]) => n).map(([k, n]) => `${k}:${n}`).join(' ');
    console.log(`    ${f.padEnd(5)} ${parts}`);
  }
  console.log(`\n  Per-family evidence depth shortfalls:`);
  const depthByFam = {};
  for (const c of claims.filter(c => c.evidence_depth === 'short')) {
    depthByFam[c.family] = (depthByFam[c.family] || 0) + 1;
  }
  for (const [f, n] of Object.entries(depthByFam)) console.log(`    ${f.padEnd(5)} short:${n}`);
  if (!Object.keys(depthByFam).length) console.log('    (none)');
  const att = db.instance.attestation;
  console.log(`\n  Affirmation: ${att?.signed_at ? `signed ${att.signed_at} by ${att.person}` : 'UNSIGNED — posture is reported unaffirmed'}`);
  console.log('  This record is generated. Regenerating it after a configuration change is the only way it changes.');
}

const runners = { crm, inherit, signals, posture, poam, access, sdr, ksi };
if (which === 'all') {
  for (const f of ['sdr', 'crm', 'inherit', 'signals', 'ksi', 'posture', 'poam', 'access']) runners[f]();
} else if (runners[which]) {
  runners[which]();
} else {
  console.error(`unknown projection: ${which}`);
  process.exit(2);
}
console.log('');
