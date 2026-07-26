// lib.mjs — the derivation core. Everything the framework reports is computed here from the
// instance graph plus the published policy files. No deliverable is stored; each is a projection.
// Dependency-free on purpose: this must run in a disconnected enclave with nothing but Node.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, '..');
const rd = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

export function load(instancePath) {
  return {
    ontology: rd('ontology/dib-ksi-ontology.json'),
    signals: rd('ontology/signals.json'),
    patterns: rd('ontology/responsibility-patterns.json'),
    poam: rd('ontology/poam-policy.json'),
    collection: rd('ontology/collection.json'),
    guidance: rd('ontology/guidance.json'),
    catalog: rd('ontology/ksi-catalog.json'),
    instance: JSON.parse(readFileSync(instancePath, 'utf8')),
  };
}

export function listInstances() {
  return readdirSync(join(ROOT, 'instances')).filter(f => f.endsWith('.json')).map(f => join(ROOT, 'instances', f));
}

const DAY = 86400000;
export const ageDays = (from, to) => (new Date(to) - new Date(from)) / DAY;

// ---- threshold expressions: ">= 95", "<= 14", "== 0", "n/a" ----
export function parseThreshold(expr) {
  if (expr == null || expr === 'n/a') return null;
  const m = String(expr).trim().match(/^(>=|<=|==|!=)\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) throw new Error(`unparseable threshold: ${expr}`);
  return { op: m[1], value: Number(m[2]) };
}
export function compare(value, t) {
  if (!t) return true;
  switch (t.op) {
    case '>=': return value >= t.value;
    case '<=': return value <= t.value;
    case '==': return value === t.value;
    case '!=': return value !== t.value;
    default: return false;
  }
}

// ---- responsibility: DERIVED from the pattern registry + the instance's declared profile ----
// This is the point of the exercise. A responsibility matrix is generated from architecture,
// never transcribed from a provider document.
export function deriveResponsibility(db) {
  const profile = db.instance.tenant.enclave_profile;
  if (!db.patterns.profiles[profile]) throw new Error(`unknown enclave profile: ${profile}`);
  const enclave = db.instance.enclaves?.[0] || null;
  const tenantClass = db.instance.tenant.target_class;

  return db.patterns.assignments.map(a => {
    const declared = a[profile];
    const r = {
      ksi: a.ksi,
      declared_mode: declared,
      mode: declared,
      provider: declared === 'inherited' || declared === 'shared' ? enclave?.id ?? null : null,
      residual: a.residual,
      tests: null,
      degraded_from: null,
    };
    if (declared === 'inherited' || declared === 'shared') {
      r.tests = threeTests(db, enclave, tenantClass);
      const failed = r.tests.filter(t => !t.pass);
      if (declared === 'inherited' && failed.length) {
        r.mode = failed[0].fails_to;         // first failing test governs the degrade target
        r.degraded_from = 'inherited';
      }
    }
    return r;
  });
}

// The three-test rule. Inheritance is earned per ingest, never declared once.
export function threeTests(db, enclave, tenantClass) {
  const classRank = { A: 0, B: 1, C: 2, D: 3 };
  const feed = enclave?.validation_feed;
  const asOf = db.instance.as_of;
  const freshSig = db.signals.signals.find(s => s.id === 'SIG-INHERIT-FRESH');
  const allowed = freshSig.cadence_days[tenantClass];
  const feedAge = feed?.last_received ? ageDays(feed.last_received, asOf) : Infinity;

  // T3: any CUI-bearing component outside the enclave means the tenant re-scoped it back in.
  const cuiOutside = (db.instance.components || []).filter(
    c => (c.processes || []).includes('CUI') && !c.hosted_in
  );

  return [
    {
      id: 'T1-COVERAGE',
      pass: !!enclave && enclave.authorization?.status === 'active' &&
            classRank[enclave.assurance_class] >= classRank[tenantClass],
      fails_to: 'tenant',
      detail: enclave ? `provider sustains Class ${enclave.assurance_class}, tenant targets Class ${tenantClass}` : 'no enclave declared',
    },
    {
      id: 'T2-FEED',
      pass: feedAge <= allowed,
      fails_to: 'shared',
      detail: `validation feed age ${feedAge.toFixed(2)}d against a ${allowed}d window at Class ${tenantClass}`,
    },
    {
      id: 'T3-NO-OVERRIDE',
      pass: cuiOutside.length === 0,
      fails_to: 'tenant',
      detail: cuiOutside.length ? `CUI processed outside the enclave by ${cuiOutside.map(c => c.id).join(', ')}` : 'no CUI processing outside the enclave',
    },
  ];
}

// ---- signal evaluation ----------------------------------------------------
// Three shapes, because authorities publish three shapes:
//   coverage — a universal requirement. Every in-scope subject must be covered; an uncovered
//              subject passes only with a justified, unexpired exception. No percentage bar,
//              because no authority publishes one.
//   range    — a bounded count (the standing-administrator bound is the only such rule any
//              authority in this space publishes).
//   threshold— a numeric bar. Used where the measurement is a latency or an age.
export function evaluateSignals(db) {
  const cls = db.instance.tenant.target_class;
  const asOf = db.instance.as_of;
  const out = [];

  for (const sig of db.signals.signals) {
    const ms = (db.instance.measurements || [])
      .filter(m => m.indicator === sig.id)
      .sort((a, b) => new Date(b.observed_at) - new Date(a.observed_at));
    const cadence = sig.cadence_days?.[cls];
    const kind = sig.kind || 'threshold';
    const t = kind === 'threshold' ? parseThreshold(sig.thresholds?.[cls]) : null;
    const applicable = kind !== 'threshold' || t !== null;

    const base = { id: sig.id, name: sig.name, kind, applicable, validates: sig.validates,
                   cadence_days: cadence, authority: sig.authority?.policy_id ?? null,
                   derived: sig.derived ?? null };

    if (!ms.length) {
      out.push({ ...base, measured: false, status: applicable ? 'unmeasured' : 'not_applicable' });
      continue;
    }
    const newest = ms[0];
    const age = ageDays(newest.observed_at, asOf);
    const fresh = cadence == null ? true : age <= cadence;
    const inWindow = cadence == null ? ms : ms.filter(m => ageDays(m.observed_at, asOf) <= cadence);
    const groups = new Set(inWindow.map(m => (db.instance.collectors.find(c => c.id === m.collector) || {}).control_plane));

    let pass, detail;
    if (kind === 'coverage') {
      // an uncovered subject is forgiven only by a justified, unexpired exception
      const uncovered = newest.uncovered || [];
      const exc = newest.exceptions || [];
      const valid = s => exc.some(e => e.subject === s && e.justification &&
                                       (!sig.exceptions?.expiry_required || (e.expires && new Date(e.expires) > new Date(asOf))));
      const unjustified = uncovered.filter(s => !valid(s));
      pass = unjustified.length <= (sig.exceptions?.max_unjustified ?? 0);
      detail = { uncovered, unjustified, exceptions: exc.length };
    } else if (kind === 'range') {
      pass = Number(newest.value) >= sig.range.min && Number(newest.value) <= sig.range.max;
      detail = { range: sig.range };
    } else {
      pass = compare(Number(newest.value), t);
      detail = { threshold: sig.thresholds?.[cls] };
    }

    out.push({ ...base, measured: true, value: newest.value, unit: sig.unit,
      pass, fresh, age_days: Number(age.toFixed(2)), evidence_type: newest.evidence_type,
      population: newest.population, independent_methods: groups.size, methods: [...groups],
      ...detail,
      status: !applicable ? 'not_applicable' : (!fresh ? 'stale' : (pass ? 'pass' : 'breach')) });
  }
  return out;
}

// ---- claims per KSI: computed from signals + responsibility. Never asserted. ----
export function deriveClaims(db, resp, sigs) {
  const cls = db.instance.tenant.target_class;
  const lvl = db.instance.tenant.target_level;
  const byKsi = Object.fromEntries(resp.map(r => [r.ksi, r]));
  const claims = [];

  for (const k of db.catalog.ksis) {
    const r = byKsi[k.id];
    const requiredAtClass = k.classes?.[cls];
    const inLevel = k.levels?.[lvl];
    const sigsFor = sigs.filter(s => (s.validates || []).includes(k.id));

    let status;
    if (!inLevel || requiredAtClass === 'n/a') status = 'not_applicable';
    else if (r?.mode === 'not_applicable') status = 'not_applicable';
    else if (r?.mode === 'inherited') status = 'inherited';
    else if (!sigsFor.length) status = 'determination_needed';
    else if (sigsFor.some(s => s.status === 'breach')) status = 'not_met';
    else if (sigsFor.some(s => s.status === 'stale' || s.status === 'unmeasured')) status = 'stale';
    else status = 'met';

    // Class C and above require two independent automated methods on automatable KSIs.
    const needsTwo = (cls === 'C' || cls === 'D') && k.automatable && status !== 'not_applicable' && status !== 'inherited';
    const methodShortfall = needsTwo && sigsFor.length
      ? Math.max(0, 2 - Math.max(...sigsFor.map(s => s.independent_methods || 0)))
      : (needsTwo ? 2 : 0);

    claims.push({
      ksi: k.id, family: k.family, automatable: k.automatable, uplift: !!k.uplift,
      responsibility: r?.mode ?? 'tenant', degraded_from: r?.degraded_from ?? null,
      status, signals: sigsFor.map(s => s.id),
      method_shortfall: methodShortfall,
      requirements: k.rev2_requirements || [],
    });
  }
  return claims;
}

// ---- findings: generated, never authored ----
export function deriveFindings(db, resp, sigs, claims) {
  const f = [];
  const asOf = db.instance.as_of;
  const cls = db.instance.tenant.target_class;
  const push = (kind, subject, detail, affects = []) =>
    f.push({ id: `FND-${String(f.length + 1).padStart(3, '0')}`, kind, subject, detail, opened_at: asOf, affects });

  for (const s of sigs) {
    if (s.status === 'breach') push('threshold_breach', s.id, `${s.name}: ${s.value} against ${s.threshold}`, s.validates);
    if (s.status === 'stale') push('stale_claim', s.id, `${s.name}: newest measurement ${s.age_days}d old against a ${s.cadence_days}d window`, s.validates);
    if (s.status === 'unmeasured' && s.applicable) push('coverage_gap', s.id, `${s.name}: required at Class ${cls} and never measured`, s.validates);
  }
  for (const c of claims) {
    if (c.method_shortfall > 0 && c.status !== 'not_applicable')
      push('coverage_gap', c.ksi, `Class ${cls} requires two independent automated methods; short by ${c.method_shortfall}`, [c.ksi]);
  }
  for (const r of resp) {
    if (r.degraded_from)
      push('inheritance_invalid', r.ksi, `claimed inherited, degraded to ${r.mode} — ${r.tests.filter(t => !t.pass).map(t => t.id + ': ' + t.detail).join('; ')}`, [r.ksi]);
  }
  for (const d of db.instance.data_assets || []) {
    if (d.data_type === 'CUI' && !d.necessity?.basis)
      push('unnecessary_data', d.id, 'CUI held with no recorded necessity basis — the cheapest control is not holding the data', []);
  }
  const reviewWindow = db.signals.signals.find(s => s.id === 'SIG-ACC-REVIEW').cadence_days[cls];
  for (const a of db.instance.access_grants || []) {
    if (!a.basis) push('unjustified_access', a.id, 'access grant with no stated basis', []);
    else if (a.last_reviewed && ageDays(a.last_reviewed, asOf) > reviewWindow)
      push('unjustified_access', a.id, `last reviewed ${ageDays(a.last_reviewed, asOf).toFixed(0)}d ago against a ${reviewWindow}d window`, []);
  }
  for (const fl of db.instance.data_flows || []) {
    if (fl.observed && !fl.declared) push('undeclared_flow', fl.id, 'observed flow with no declaration in the dataflow model', ['KSI-SCB-DFD']);
  }
  return f;
}

// ---- exceptions: requirement-level eligibility, computed ----
export function deriveExceptions(db, findings, claims) {
  const rev = '171r2';
  const ineligible = new Set(db.poam.ineligible_requirements[rev] || []);
  const byKsi = Object.fromEntries(claims.map(c => [c.ksi, c]));
  const out = [];
  for (const fd of findings) {
    const reqs = [...new Set(fd.affects.flatMap(k => byKsi[k]?.requirements || []))];
    if (!reqs.length) continue;
    const blocked = reqs.filter(r => ineligible.has(r));
    out.push({
      finding: fd.id,
      kind: fd.kind,
      requirements: reqs,
      eligible: blocked.length === 0,
      blocked_by: blocked,
      window_days: db.poam.default_window_days,
      policy_status: db.poam.status,
    });
  }
  return out;
}

export function derive(db) {
  const resp = deriveResponsibility(db);
  const sigs = evaluateSignals(db);
  const claims = deriveClaims(db, resp, sigs);
  const findings = deriveFindings(db, resp, sigs, claims);
  const exceptions = deriveExceptions(db, findings, claims);
  return { resp, sigs, claims, findings, exceptions };
}

// ---- validation: structural, referential, and invariant. Returns, never prints. ----
export function validateGraph(db) {
  const errors = [], warnings = [];
  const E = (code, msg) => errors.push({ code, msg });
  const W = (code, msg) => warnings.push({ code, msg });

  const idset = c => new Set((db.instance[c] || []).map(x => x.id));
  const P = idset('parties'), EN = idset('enclaves'), B = idset('boundaries'), DA = idset('data_assets'),
        C = idset('components'), PSN = idset('persons'), ROL = idset('roles'), COL = idset('collectors');
  const KSI = new Set(db.catalog.ksis.map(k => k.id));
  const SIG = new Set(db.signals.signals.map(s => s.id));
  const ENUM = db.ontology.enums;

  for (const e of db.instance.enclaves || []) if (!P.has(e.provider)) E('REF', `enclave ${e.id} provider ${e.provider} not found`);
  for (const b of db.instance.boundaries || []) if (b.enclave && !EN.has(b.enclave)) E('REF', `boundary ${b.id} enclave ${b.enclave} not found`);
  for (const d of db.instance.data_assets || []) {
    if (!B.has(d.resides_in) && !EN.has(d.resides_in)) E('REF', `data asset ${d.id} resides_in ${d.resides_in} not found`);
    if (!ENUM.data_type.includes(d.data_type)) E('ENUM', `data asset ${d.id} data_type ${d.data_type} not in enum`);
  }
  for (const c of db.instance.components || []) {
    if (!B.has(c.boundary)) E('REF', `component ${c.id} boundary ${c.boundary} not found`);
    if (c.hosted_in && !EN.has(c.hosted_in)) E('REF', `component ${c.id} hosted_in ${c.hosted_in} not found`);
    if (!P.has(c.operated_by)) E('REF', `component ${c.id} operated_by ${c.operated_by} not found`);
    if (!ENUM.asset_category.includes(c.asset_category)) E('ENUM', `component ${c.id} asset_category ${c.asset_category} not in enum`);
    if (!ENUM.determination_status.includes(c.category_status)) E('ENUM', `component ${c.id} category_status ${c.category_status} not in enum`);
    else if (c.category_status !== 'human_confirmed') W('DETERMINATION', `component ${c.id} categorization is ${c.category_status}; categorization is a human determination`);
  }
  for (const f of db.instance.data_flows || []) {
    if (!C.has(f.from)) E('REF', `flow ${f.id} from ${f.from} not found`);
    if (!C.has(f.to)) E('REF', `flow ${f.id} to ${f.to} not found`);
  }
  for (const p of db.instance.persons || []) {
    if (!P.has(p.party)) E('REF', `person ${p.id} party ${p.party} not found`);
    for (const r of p.roles || []) if (!ROL.has(r)) E('REF', `person ${p.id} role ${r} not found`);
  }
  for (const a of db.instance.access_grants || []) {
    if (!PSN.has(a.person)) E('REF', `access grant ${a.id} person ${a.person} not found`);
    if (!DA.has(a.data_asset)) E('REF', `access grant ${a.id} data asset ${a.data_asset} not found`);
    if (!ENUM.privilege.includes(a.privilege)) E('ENUM', `access grant ${a.id} privilege ${a.privilege} not in enum`);
    if (!ENUM.mfa_strength.includes(a.mfa)) E('ENUM', `access grant ${a.id} mfa ${a.mfa} not in enum`);
  }
  for (const m of db.instance.measurements || []) {
    if (!SIG.has(m.indicator)) E('REF', `measurement ${m.id} indicator ${m.indicator} not in the signal registry`);
    if (!COL.has(m.collector)) E('REF', `measurement ${m.id} collector ${m.collector} not found`);
    if (!ENUM.evidence_type.includes(m.evidence_type)) E('ENUM', `measurement ${m.id} evidence_type ${m.evidence_type} not in enum`);
    if (!m.population || typeof m.population.measured !== 'number' || typeof m.population.total !== 'number')
      E('POPULATION', `measurement ${m.id} lacks a published population {measured,total}`);
    else if (m.population.measured > m.population.total) E('POPULATION', `measurement ${m.id} measured exceeds total`);
    if (ageDays(m.observed_at, db.instance.as_of) < 0) E('TIME', `measurement ${m.id} observed in the future relative to as_of`);
  }
  for (const s of db.signals.signals) for (const k of s.validates) if (!KSI.has(k)) E('REF', `signal ${s.id} validates unknown KSI ${k}`);

  const patternKsis = new Set(db.patterns.assignments.map(a => a.ksi));
  for (const k of KSI) if (!patternKsis.has(k)) E('COVERAGE', `KSI ${k} has no responsibility assignment in the pattern registry`);
  for (const a of db.patterns.assignments) {
    if (!KSI.has(a.ksi)) E('COVERAGE', `pattern registry references unknown KSI ${a.ksi}`);
    for (const prof of Object.keys(db.patterns.profiles))
      if (!ENUM.responsibility_mode.includes(a[prof])) E('ENUM', `assignment ${a.ksi} profile ${prof} mode ${a[prof]} not in enum`);
  }

  const { resp, sigs, claims, findings } = derive(db);

  for (const r of resp) {
    if (r.mode === 'inherited' && r.tests && r.tests.some(t => !t.pass))
      E('INV-INHERITANCE', `${r.ksi} stands as inherited despite a failing test`);
    if (r.degraded_from) W('INV-INHERITANCE', `${r.ksi} degraded from inherited to ${r.mode}`);
  }
  for (const f of findings.filter(f => f.kind === 'unnecessary_data' || f.kind === 'unjustified_access'))
    W(f.kind.toUpperCase(), `${f.subject}: ${f.detail}`);
  for (const f of findings.filter(f => f.kind === 'undeclared_flow'))
    W('UNDECLARED_FLOW', `${f.subject}: ${f.detail}`);
  for (const c of claims.filter(c => c.status === 'met')) {
    const supporting = sigs.filter(s => c.signals.includes(s.id));
    if (supporting.some(s => !s.fresh)) E('INV-SIGNAL', `${c.ksi} reported met on stale support`);
  }
  const att = db.instance.attestation;
  if (att?.signed_at && (!att.posture_hash || att.posture_hash === 'computed-at-signature-time'))
    E('INV-HUMAN', 'signed attestation lacks a posture hash binding the signature to the state signed');
  if (att && !att.signed_at) W('INV-HUMAN', 'attestation is unsigned; posture is reported as unaffirmed');
  if (att?.person && !PSN.has(att.person)) E('REF', `attestation person ${att.person} not found`);

  const shortfalls = claims.filter(c => c.method_shortfall > 0).length;
  if (shortfalls) W('INV-INDEPENDENCE', `${shortfalls} KSI(s) short of two independent automated methods at Class ${db.instance.tenant.target_class}`);

  return { errors, warnings };
}
