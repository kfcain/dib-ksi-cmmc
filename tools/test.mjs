// test.mjs — the test suite. Positive cases prove the framework computes; negative cases prove it
// fails closed. Every invariant in the ontology has at least one test that must fail without it.
// Run: node tools/test.mjs
import { load, validateGraph, derive, deriveResponsibility, parseThreshold, compare, ROOT, evaluateEvidenceFloor, evidenceFloorFor } from './lib.mjs';
import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const BASE = join(ROOT, 'instances', 'ostrander-enclave.json');
let pass = 0, fail = 0;

function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.error(`  FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
// deep clone + mutate, returning a fresh db
function mutate(fn) {
  const db = load(BASE);
  db.instance = JSON.parse(JSON.stringify(db.instance));
  fn(db.instance, db);
  return db;
}
const hasErr = (r, code) => r.errors.some(e => e.code === code);
const hasWarn = (r, code) => r.warnings.some(w => w.code === code);

console.log('\n=== threshold algebra ===');
check('parses and applies >=', compare(99, parseThreshold('>= 98')));
check('parses and applies <=', compare(14, parseThreshold('<= 14')));
check('parses and applies ==', compare(0, parseThreshold('== 0')));
check('rejects a breach', !compare(97.5, parseThreshold('>= 98')));
check('treats n/a as no bar', compare(0, parseThreshold('n/a')));
check('refuses an unparseable threshold', (() => { try { parseThreshold('mostly fine'); return false; } catch { return true; } })());

console.log('\n=== base instance ===');
{
  const db = load(BASE);
  const r = validateGraph(db);
  check('base instance validates with zero errors', r.errors.length === 0, JSON.stringify(r.errors.slice(0, 3)));
  const d = derive(db);
  check('responsibility derived for all 64 KSIs', d.resp.length === 64, `got ${d.resp.length}`);
  check('claims derived for all 64 KSIs', d.claims.length === 64, `got ${d.claims.length}`);
  check('no assignment stands inherited with a failing test', !d.resp.some(x => x.mode === 'inherited' && x.tests?.some(t => !t.pass)));
  check('findings are generated, not authored', d.findings.length > 0 && !('findings' in db.instance));
  check('no deliverable is stored in the instance',
    !['sdr', 'crm', 'poam', 'responsibility_assignments', 'claims'].some(k => k in db.instance));
  const det = d.claims.filter(c => c.status === 'determination_needed').length;
  check('non-automatable KSIs report determination_needed rather than met', det > 0, `got ${det}`);
}

console.log('\n=== INV-INHERITANCE: the three-test rule ===');
{
  // T2 — the provider feed goes stale
  const db = mutate(i => { i.enclaves[0].validation_feed.last_received = '2026-06-01T00:00:00Z'; });
  const resp = deriveResponsibility(db);
  const degraded = resp.filter(r => r.degraded_from === 'inherited');
  check('stale provider feed degrades every inherited assignment', degraded.length > 0 && degraded.every(r => r.mode === 'shared'), `${degraded.length} degraded`);
  check('a stale feed still validates as a graph but reports the degrade', hasWarn(validateGraph(db), 'INV-INHERITANCE'));
}
{
  // T3 — the tenant processes CUI outside the enclave
  const db = mutate(i => {
    i.components.push({ id: 'CMP-ROGUE', name: 'Local CUI workstation', asset_category: 'CUI',
      category_status: 'human_confirmed', boundary: 'BND-CORP', platform_lane: 'endpoint',
      operated_by: 'PTY-OSTRANDER', processes: ['CUI'] });
  });
  const resp = deriveResponsibility(db);
  const t3 = resp.find(r => r.tests)?.tests.find(t => t.id === 'T3-NO-OVERRIDE');
  check('CUI outside the enclave fails T3', t3 && !t3.pass);
  check('a failed T3 degrades inheritance to tenant', resp.filter(r => r.degraded_from).every(r => r.mode === 'tenant'));
}
{
  // T1 — the provider sustains a lower class than the tenant targets
  const db = mutate(i => { i.enclaves[0].assurance_class = 'B'; });
  const t1 = deriveResponsibility(db).find(r => r.tests)?.tests.find(t => t.id === 'T1-COVERAGE');
  check('a provider below the tenant class fails T1', t1 && !t1.pass);
}
{
  // an expired authorization is not coverage
  const db = mutate(i => { i.enclaves[0].authorization.status = 'expired'; });
  const t1 = deriveResponsibility(db).find(r => r.tests)?.tests.find(t => t.id === 'T1-COVERAGE');
  check('an expired provider authorization fails T1', t1 && !t1.pass);
}

console.log('\n=== INV-SIGNAL: documents cannot age into truth ===');
{
  const db = mutate(i => { for (const m of i.measurements) m.observed_at = '2026-01-01T00:00:00Z'; });
  const d = derive(db);
  check('aged measurements turn passing signals stale', d.sigs.some(s => s.status === 'stale'));
  check('a stale signal never leaves its KSI reported met',
    !d.claims.some(c => c.status === 'met' && c.signals.some(id => d.sigs.find(s => s.id === id)?.status === 'stale')));
  check('staleness produces findings', d.findings.some(f => f.kind === 'stale_claim'));
}

console.log('\n=== INV-MINIMIZATION and INV-ACCESS: first principles ===');
{
  const db = mutate(i => { delete i.data_assets[0].necessity; });
  const d = derive(db);
  check('CUI held with no necessity basis opens a finding', d.findings.some(f => f.kind === 'unnecessary_data'));
  check('the graph still validates and warns rather than silently passing', hasWarn(validateGraph(db), 'UNNECESSARY_DATA'));
}
{
  const db = mutate(i => { delete i.access_grants[1].basis; });
  check('access with no stated basis opens a finding', derive(db).findings.some(f => f.kind === 'unjustified_access'));
}
{
  const db = mutate(i => { i.access_grants[1].last_reviewed = '2024-01-01'; });
  check('an access grant reviewed outside the window opens a finding', derive(db).findings.some(f => f.kind === 'unjustified_access'));
}

console.log('\n=== scope integrity ===');
{
  const db = mutate(i => {
    i.data_flows.push({ id: 'FLW-99', from: 'CMP-ERP', to: 'CMP-FW', data_type: 'CUI', ports: [22],
      protocol: 'SSH', encryption: { mechanism: 'SSH', cmvp_cert: null, cmvp_status: 'none' }, declared: false, observed: true });
  });
  const d = derive(db);
  check('an observed flow with no declaration opens a finding', d.findings.some(f => f.kind === 'undeclared_flow'));
  check('the undeclared flow lands on the boundary KSI', d.findings.some(f => f.kind === 'undeclared_flow' && f.affects.includes('KSI-SCB-DFD')));
}

console.log('\n=== structural fail-closed ===');
check('a measurement without a published denominator is rejected',
  hasErr(validateGraph(mutate(i => { delete i.measurements[0].population; })), 'POPULATION'));
check('a measurement claiming more subjects than exist is rejected',
  hasErr(validateGraph(mutate(i => { i.measurements[0].population = { measured: 99, total: 41 }; })), 'POPULATION'));
check('a measurement against an unknown indicator is rejected',
  hasErr(validateGraph(mutate(i => { i.measurements[0].indicator = 'SIG-INVENTED'; })), 'REF'));
check('a measurement from an unknown collector is rejected',
  hasErr(validateGraph(mutate(i => { i.measurements[0].collector = 'COL-GHOST'; })), 'REF'));
check('a component in a nonexistent boundary is rejected',
  hasErr(validateGraph(mutate(i => { i.components[0].boundary = 'BND-NOWHERE'; })), 'REF'));
check('a value outside the published enum is rejected',
  hasErr(validateGraph(mutate(i => { i.components[0].asset_category = 'SORT_OF_CUI'; })), 'ENUM'));
check('a measurement timestamped after as_of is rejected',
  hasErr(validateGraph(mutate(i => { i.measurements[0].observed_at = '2027-01-01T00:00:00Z'; })), 'TIME'));

console.log('\n=== INV-HUMAN: the one thing that is never computed ===');
check('a signed attestation without a posture hash is rejected',
  hasErr(validateGraph(mutate(i => { i.attestation.signed_at = '2026-07-19T13:00:00Z'; })), 'INV-HUMAN'));
check('an unsigned attestation is reported unsigned, never assumed',
  hasWarn(validateGraph(load(BASE)), 'INV-HUMAN'));
check('a signed attestation bound by hash is accepted',
  !hasErr(validateGraph(mutate(i => { i.attestation.signed_at = '2026-07-19T13:00:00Z'; i.attestation.posture_hash = 'sha256:abc123'; })), 'INV-HUMAN'));

console.log('\n=== the enclave pattern earns its claim ===');
{
  const db = load(BASE);
  const only = deriveResponsibility(db);
  const offOnly = only.filter(r => r.mode === 'inherited' || r.mode === 'not_applicable').length;
  const db2 = mutate(i => { i.tenant.enclave_profile = 'enclave-plus-endpoints'; });
  const plus = deriveResponsibility(db2);
  const offPlus = plus.filter(r => r.mode === 'inherited' || r.mode === 'not_applicable').length;
  check('enclave-only puts materially more off the tenant than enclave-plus-endpoints', offOnly > offPlus, `${offOnly} vs ${offPlus}`);
  check('the enclave never carries personnel, training, marking, reporting, or affirmation',
    ['KSI-PER-SCR', 'KSI-CED-CUI', 'KSI-CED-RAT', 'KSI-CUI-MRK', 'KSI-INR-RPI']
      .every(id => only.find(r => r.ksi === id)?.mode === 'tenant'));
  check('scope declaration stays with the tenant in every profile',
    ['KSI-SCB-ACT', 'KSI-SCB-DFD'].every(id => only.find(r => r.ksi === id)?.mode === 'tenant' && plus.find(r => r.ksi === id)?.mode === 'tenant'));
  check('an unknown profile is refused rather than guessed',
    (() => { try { deriveResponsibility(mutate(i => { i.tenant.enclave_profile = 'wishful'; })); return false; } catch { return true; } })());
}

console.log('\n=== INV-AUTHORITY: every number is sourced or owned ===');
{
  const db = load(BASE);
  const sigs = db.signals.signals;
  check('every signal cites an authority or is flagged local policy with a rationale',
    sigs.every(s => (s.authority && s.authority.policy_id) || (s.derived === 'local-policy' && s.rationale)),
    sigs.filter(s => !(s.authority?.policy_id) && !(s.derived === 'local-policy' && s.rationale)).map(s => s.id).join(', '));
  check('no coverage signal carries a percentage threshold',
    !sigs.some(s => s.kind === 'coverage' && s.thresholds));
  check('every coverage signal requires justified, dated exceptions',
    sigs.filter(s => s.kind === 'coverage').every(s => s.exceptions?.justification_required && s.exceptions?.expiry_required && s.exceptions.max_unjustified === 0));
  check('authority-bound signals carry a citable URL',
    sigs.filter(s => s.authority).every(s => /^https?:\/\//.test(s.authority.url || '')));
  check('every signal names collection methods that exist in the method taxonomy',
    (() => { const ids = new Set(db.collection.methods.map(m => m.id));
             return sigs.every(s => (s.methods || []).length > 0 && s.methods.every(m => ids.has(m))); })());

  check('every collector in an instance declares a method from the taxonomy',
    (() => { const ids = new Set(db.collection.methods.map(m => m.id));
             return db.instance.collectors.every(c => ids.has(c.method)); })());

  check('a measurement cannot be produced by a method its signal does not accept',
    (() => {
      const byId = Object.fromEntries(db.instance.collectors.map(c => [c.id, c]));
      const byhSig = Object.fromEntries(db.signals.signals.map(s => [s.id, s]));
      return db.instance.measurements.every(m => {
        const col = byId[m.collector], sig = byhSig[m.indicator];
        if (!col || !sig) return true;              // reference errors are caught elsewhere
        return sig.methods.includes(col.method);
      });
    })());

  check('every collector declares the control plane it reads from',
    db.instance.collectors.every(c => typeof c.control_plane === 'string' && c.control_plane.length));

  check('the collection registry separates criteria sources from methods',
    Array.isArray(db.collection.methods) && !!db.collection.criteria_sources
      && !!db.collection.interface && !!db.collection.independence);

  check('every invariant explains itself in plain language',
    db.ontology.invariants.every(i => i.plain && i.without_it && i.example && i.checked));

  check('the plain-language layer never sends a reader to a filename',
    db.ontology.invariants.every(i =>
      ![i.plain, i.without_it, i.example, i.checked].join(' ').match(/tools\/|\.mjs|\.json\b/)));

  check('the scenario set covers more than one deployment shape',
    (() => { const c = db.ontology.scenarios?.cases || [];
             return c.length >= 3 && new Set(c.map(x => x.profile)).size > 1
                    && c.every(x => x.situation && x.what_you_run && x.first_finding && x.hardest_part); })());

  check('scenario figures are consistent with the catalogue, not typed in',
    (() => (db.ontology.scenarios?.cases || []).every(x =>
        x.split.in_scope === x.split.inherited + x.split.not_applicable + x.split.shared + x.split.tenant
        && x.split.off === x.split.inherited + x.split.not_applicable))());

  // The bug this replaces: a scenario claimed "nothing inherited" while its own
  // computed figure said otherwise. Prose and arithmetic must agree.
  check('no scenario claims an inheritance level its own figures contradict',
    (() => (db.ontology.scenarios?.cases || []).every(c => {
        const text = [c.what_you_run, c.hardest_part, c.first_finding, c.inheritance_note || ''].join(' ');
        const claimsNone = /nothing inherited|none inherited|no inheritance/i.test(text);
        return !(claimsNone && c.split.off > 0);
      }))());

  check('every scenario names a deployment profile that exists',
    (() => { const p = new Set(Object.keys(db.patterns.profiles));
             return (db.ontology.scenarios?.cases || []).every(c => p.has(c.profile)); })());

  check('every profile assigns a mode to every indicator',
    (() => { const modes = new Set(['inherited', 'not_applicable', 'shared', 'tenant']);
             return Object.keys(db.patterns.profiles).every(p =>
               db.patterns.assignments.every(a => modes.has(a[p]))); })());

  check('a profile with no dedicated enclave still inherits the physical layer',
    (() => { const byK = Object.fromEntries(db.patterns.assignments.map(a => [a.ksi, a]));
             return byK['KSI-PHY-LPA']['commercial-cloud'] === 'inherited'
                 && byK['KSI-PHY-MEV']['commercial-cloud'] === 'inherited'; })());

  check('every evidence type explains what it proves and where it stops',
    (() => (db.ontology.evidence_types?.types || []).every(t =>
        t.what && t.strong && t.weak && t.mistake && (t.examples || []).length >= 3))());

  check('evidence examples span the same scopes as the scenarios',
    (() => { const t = db.ontology.evidence_types?.types || [];
             return t.length === 5 && t.every(x => new Set(x.examples.map(e => e.scope)).size === x.examples.length); })());

  check('the published working sets match what the model computes',
    (() => {
      const by = Object.fromEntries(db.patterns.assignments.map((a) => [a.ksi, a]));
      const cases = Object.fromEntries((db.ontology.scenarios?.cases || []).map((c) => [c.id, c]));
      return (db.ontology.working_sets?.sets || []).every((w) => {
        const c = cases[w.id]; if (!c) return false;
        const inScope = db.catalog.ksis.filter((k) => {
          const st = (k.classes || {})[c.class]; return st && st !== 'n/a';
        });
        const own = inScope.filter((k) => by[k.id][c.profile] === 'tenant');
        return w.own === own.length
            && w.families === new Set(own.map((k) => k.family)).size
            && w.automatable === own.filter((k) => k.automatable).length
            && w.manual === own.length - own.filter((k) => k.automatable).length;
      });
    })());

  // The front page grew to fifteen navigable sections across two overlapping
  // pages before anyone noticed. A budget makes regrowth a build failure rather
  // than something discovered a year later.
  check('the site stays within its navigation budget',
    (() => {
      const ref = readFileSync(resolve(ROOT, 'site/reference.html'), 'utf8');
      const tabs = [...ref.matchAll(/data-tab="(\w+)"/g)].map((m) => m[1]);
      return new Set(tabs).size <= 6;
    })());

  check('the overview does not duplicate the reference tool',
    (() => {
      const idx = readFileSync(resolve(ROOT, 'site/index.html'), 'utf8');
      return !/data-tab=/.test(idx) && /id="picker"/.test(idx);
    })());

  // Three pages, three jobs: understand, answer, look up. A page doing two jobs
  // is how fifteen tabs happened last time.
  check('each page does one job and links the other two',
    (() => {
      const rd = (f) => readFileSync(resolve(ROOT, 'site/' + f), 'utf8');
      const [idx, ass, ref] = ['index.html', 'assess.html', 'reference.html'].map(rd);
      return /assess\.html/.test(idx) && /reference\.html/.test(idx)
          && /index\.html/.test(ass) && /reference\.html/.test(ass)
          && /index\.html/.test(ref) && /assess\.html/.test(ref)
          && !/data-tab=/.test(ass);
    })());

  // The assessment must not contradict the invariant the framework rests on.
  // Checking for the word "score" flagged the sentence explaining that no score
  // is given. The property that matters is arithmetic: nothing may divide the
  // answers by their count or turn them into a percentage.
  check('the self-assessment computes no aggregate score',
    (() => {
      const ass = readFileSync(resolve(ROOT, 'site/assess.html'), 'utf8');
      const app = ass.slice(ass.lastIndexOf('<script>'));
      const scoring = [
        /\/\s*(ks|list|all)\.length/,          // dividing by the population
        /\*\s*100\b/,                          // turning a ratio into a percent
        /toFixed\s*\(/,                         // formatting one
        /reduce\([^)]*\+[^)]*(score|weight)/i,  // summing weights
      ];
      return !scoring.some((re) => re.test(app));
    })());

  check('the self-assessment asks the plain question where one is written',
    (() => {
      const ass = readFileSync(resolve(ROOT, 'site/assess.html'), 'utf8');
      return /GUIDE\[k\.id\]/.test(ass) && /g\.question/.test(ass);
    })());

  check('every guidance entry names a real indicator and answers all four questions',
    (() => { const ids = new Set(db.catalog.ksis.map((k) => k.id));
             return Object.entries(db.guidance.guidance).every(([id, g]) =>
               ids.has(id) && g.question && g.in_place && g.evidence && g.check); })());

  check('guidance covers every indicator a tenant owns alone in the smallest profile',
    (() => {
      const by = Object.fromEntries(db.patterns.assignments.map((a) => [a.ksi, a]));
      const owned = db.catalog.ksis.filter((k) => {
        const st = (k.classes || {}).B; return st && st !== 'n/a' && by[k.id]['enclave-only'] === 'tenant';
      });
      return owned.every((k) => db.guidance.guidance[k.id]);
    })());

  // A partly-mechanical check on a control that is not fully automatable is both
  // legitimate and valuable — the separation-to-revocation join is one query and
  // catches the most common real breach path. What must not happen is a check
  // reading as though the machine discharges the whole control. So the rule is:
  // where the catalogue says not automatable, the guidance must name what stays
  // human, not merely disclaim automation.
  check('guidance names the human residue wherever a control is not fully automatable',
    (() => {
      const by = Object.fromEntries(db.catalog.ksis.map((k) => [k.id, k]));
      return Object.entries(db.guidance.guidance).every(([id, g]) =>
        by[id].automatable
        || /human|judgment|not automatable|a person still|cannot (make|read|assess|stand)/i.test(g.check));
    })());

  check('every signal resolves to a declared criteria source',
    (() => { const ids = new Set(db.collection.criteria_sources.sources.map(c => c.id));
             return sigs.every(s => ids.has(s.authority ? s.authority.criteria_source : s.criteria_source)); })());

  // The property that actually matters is that the *authority* names criteria, not a
  // tool. Testing for approved words was the wrong shape: a contract clause is a
  // perfectly good authority and matches no keyword list.
  check('a signal citing an authority never names a tool as the authority',
    (() => { const products = /\b(scubagear|scubagoggles|prowler|cinc|inspec|openscap|kyverno|conftest|nessus|qualys|tenable|wiz|crowdstrike|splunk)\b/i;
             return sigs.every(s => !s.authority || !products.test(s.authority.source)); })());

  check('no signal names a product as its collection mechanism',
    (() => { const ids = new Set(db.collection.methods.map(m => m.id));
             return sigs.every(s => !('collectors' in s) && s.methods.every(m => ids.has(m))); })());
}

console.log('\n=== coverage semantics: named exceptions, not percentages ===');
{
  // an uncovered subject with no exception fails
  const db = mutate(i => { i.measurements.filter(x => x.indicator === 'SIG-MFA-ENF').forEach(m => { m.uncovered = ['svc-legacy']; m.exceptions = []; }); });
  check('one uncovered subject with no exception breaches the signal',
    derive(db).sigs.find(s => s.id === 'SIG-MFA-ENF').status === 'breach');
  // the same subject with a justified, unexpired exception passes
  const db2 = mutate(i => { i.measurements.filter(x => x.indicator === 'SIG-MFA-ENF').forEach(m => {
      m.uncovered = ['svc-legacy']; m.exceptions = [{ subject: 'svc-legacy', justification: 'break-glass account under compensating control', expires: '2027-01-01' }]; }); });
  check('a justified, unexpired exception clears it', derive(db2).sigs.find(s => s.id === 'SIG-MFA-ENF').status === 'pass');
  // an expired exception does not
  const db3 = mutate(i => { i.measurements.filter(x => x.indicator === 'SIG-MFA-ENF').forEach(m => {
      m.uncovered = ['svc-legacy']; m.exceptions = [{ subject: 'svc-legacy', justification: 'expired', expires: '2026-01-01' }]; }); });
  check('an expired exception does not clear it', derive(db3).sigs.find(s => s.id === 'SIG-MFA-ENF').status === 'breach');
  // an exception without justification does not
  const db4 = mutate(i => { i.measurements.filter(x => x.indicator === 'SIG-MFA-ENF').forEach(m => {
      m.uncovered = ['svc-legacy']; m.exceptions = [{ subject: 'svc-legacy', expires: '2027-01-01' }]; }); });
  check('an exception with no justification does not clear it', derive(db4).sigs.find(s => s.id === 'SIG-MFA-ENF').status === 'breach');
  // the bounded-count rule
  const db5 = mutate(i => { i.measurements.find(x => x.indicator === 'SIG-ADMIN-COUNT').value = 12; });
  check('too many standing administrators breaches the bounded count',
    derive(db5).sigs.find(s => s.id === 'SIG-ADMIN-COUNT').status === 'breach');
  const db6 = mutate(i => { i.measurements.find(x => x.indicator === 'SIG-ADMIN-COUNT').value = 1; });
  check('too few standing administrators also breaches it', derive(db6).sigs.find(s => s.id === 'SIG-ADMIN-COUNT').status === 'breach');
}

console.log('\n=== registry integrity ===');
{
  const db = load(BASE);
  const ksis = new Set(db.catalog.ksis.map(k => k.id));
  check('every KSI has a responsibility assignment', db.patterns.assignments.every(a => ksis.has(a.ksi)) && db.patterns.assignments.length === ksis.size);
  check('every signal validates only real KSIs', db.signals.signals.every(s => s.validates.every(k => ksis.has(k))));
  check('every signal publishes a cadence for every class',
    db.signals.signals.every(s => ['A', 'B', 'C', 'D'].every(c => c in s.cadence_days)));
  check('every ontology invariant names its enforcement', db.ontology.invariants.every(i => i.enforced_by && i.statement));
  check('every KSI states its CUI-confidentiality impact', db.catalog.ksis.every(k => typeof k.cui_impact === 'string' && k.cui_impact.length > 0));
  check('every uplift KSI admits it sits beyond the confidentiality floor',
    db.catalog.ksis.filter(k => k.uplift).every(k => /beyond the 800-171 confidentiality floor/.test(k.cui_impact)));
  check('the POA&M policy declares that it needs confirmation against the rule', /REQUIRES CONFIRMATION/.test(db.poam.status));
}

console.log('\n=== INV-EVIDENCE-FLOOR: class evidence depth ===');
{
  const db = load(BASE);
  const floors = db.catalog.evidence_floors;
  check('every class_rules key has machine-checkable evidence_floors',
    Object.keys(db.catalog.class_rules).every(c => floors?.[c]?.automatable && floors?.[c]?.physical));
  check('Class C automatable floor requires two independent E1 methods and E3',
    floors.C.automatable.min_e1_methods === 2
      && floors.C.automatable.independent_control_planes === true
      && floors.C.automatable.required_types.includes('E1')
      && floors.C.automatable.required_types.includes('E3'));
  check('Class B automatable floor requires E1 plus another type',
    floors.B.automatable.min_e1_methods === 1 && floors.B.automatable.require_other_type === true);
  check('Class C physical floor requires E2 and one of E4/E5',
    floors.C.physical.required_types.includes('E2')
      && floors.C.physical.require_one_of.some(g => g.includes('E4') && g.includes('E5')));

  const d = derive(db);
  check('base instance seeds EvidenceRefs', (db.instance.evidence_refs || []).length >= 1);
  check('claims carry evidence_depth distinct from status',
    d.claims.every(c => c.evidence_depth && c.status));
  check('a green signal bar can coexist with evidence_depth short',
    d.claims.some(c => c.status === 'met' && c.evidence_depth === 'short'));
  // Ostrander targets Class C: dual MFA + E3 refs make IAM-APM depth met; many others stay short.
  const apm = d.claims.find(c => c.ksi === 'KSI-IAM-APM');
  check('KSI-IAM-APM reaches evidence_depth met with dual E1 and E3 ref',
    apm?.status === 'met' && apm?.evidence_depth === 'met' && apm.present_types.includes('E3') && apm.e1_methods >= 2,
    JSON.stringify({ status: apm?.status, depth: apm?.evidence_depth, present: apm?.present_types, e1: apm?.e1_methods }));
  check('some applicable KSIs report evidence_depth short rather than pretending met',
    d.claims.some(c => c.evidence_depth === 'short'));
  check('evidence floor shortfalls open coverage_gap findings',
    d.findings.some(f => f.kind === 'coverage_gap' && /evidence floor short/.test(f.detail)));
}
{
  // Removing E3 refs must drop depth on IAM-APM even if signals still pass.
  const db = mutate(i => { i.evidence_refs = (i.evidence_refs || []).filter(r => r.evidence_type !== 'E3'); });
  const apm = derive(db).claims.find(c => c.ksi === 'KSI-IAM-APM');
  check('dropping E3 refs makes IAM-APM evidence_depth short while status can stay met',
    apm?.status === 'met' && apm?.evidence_depth === 'short' && apm.missing_types.includes('E3'),
    JSON.stringify({ status: apm?.status, depth: apm?.evidence_depth, missing: apm?.missing_types }));
}
{
  // Collapse collectors onto one control plane — independence fails Class C floor.
  const db = mutate(i => {
    for (const c of i.collectors) c.control_plane = 'one-plane';
  });
  const apm = derive(db).claims.find(c => c.ksi === 'KSI-IAM-APM');
  check('one control plane cannot satisfy Class C independent E1 floor',
    apm?.evidence_depth === 'short' && apm.missing_types.some(m => /E1_methods/.test(m)),
    JSON.stringify({ depth: apm?.evidence_depth, missing: apm?.missing_types, e1: apm?.e1_methods }));
}
{
  // evaluateEvidenceFloor refuses Class C met on thin evidence
  const db = load(BASE);
  const floor = evidenceFloorFor(db, true, 'C');
  const ev = evaluateEvidenceFloor(floor, { present_types: ['E1'], e1_methods: 1, independent_methods: 1 });
  check('evaluateEvidenceFloor refuses Class C met on single E1 without E3',
    !ev.floor_met && ev.missing_types.includes('E3') && ev.e1_shortfall >= 1);
}
{
  // Validator rejects forged evidence_depth met without floor_met
  const db = load(BASE);
  const r = validateGraph(db);
  // Patch after derive inside validateGraph — simulate by mutating catalog floors away
  const db2 = mutate((i, full) => {
    delete full.catalog.evidence_floors.C;
  });
  check('missing evidence_floors for a class fails validation', hasErr(validateGraph(db2), 'EVIDENCE_FLOOR'));
  check('base instance still validates with evidence floors present', r.errors.length === 0);
}
{
  const db = mutate(i => {
    i.evidence_refs.push({
      id: 'EVR-BAD', evidence_type: 'E9', hash: 'x', collected_at: '2026-07-01T00:00:00Z', supports: ['KSI-IAM-APM'],
    });
  });
  check('invalid evidence_type on EvidenceRef fails closed', hasErr(validateGraph(db), 'ENUM'));
}
{
  const db = mutate(i => {
    i.evidence_refs.push({
      id: 'EVR-NOHASH', evidence_type: 'E3', collected_at: '2026-07-01T00:00:00Z', supports: ['KSI-IAM-APM'],
    });
  });
  check('EvidenceRef without hash fails closed', hasErr(validateGraph(db), 'EVIDENCE'));
}

console.log(`\n${fail ? 'TESTS FAILED' : 'TESTS OK'} — ${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
