# Changelog

Versions follow the intent described in [CONTRIBUTING.md](CONTRIBUTING.md): a major bump changes an invariant, an enum, or the meaning of a field; a minor bump adds an entity, relation, indicator, or profile without changing how existing data is interpreted; a patch is clarification.

## 0.9.0 — 2026-07-25

The reference tool could be read. It could not be answered.

**Added**

- `site/assess.html` — a self-assessment. Pick your shape, get the indicators that apply, and answer one plain question each: in place, partly, not in place, or don't know. Optionally include the ones shared with your provider.
- Three pages, three jobs. Understand, answer, look up. Each links the other two, and a check enforces that none of them starts doing a second job — which is how fifteen tabs happened last time.
- A downloadable gap list in Markdown, grouped by answer, with the responsibility and the automatable/human split per indicator.

**Deliberately absent**

- Any readiness score. Scoring would break `INV-UNIVERSAL`, the rule the whole framework rests on: coverage is universal, so an aggregate percentage hides which subject is uncovered — and that subject is the only part anyone can act on. The output is a named list. A check enforces this by looking for the arithmetic rather than the vocabulary, after an earlier version flagged the sentence explaining that no score is given.
- Any persistence. Answers live in the tab and nothing else, which keeps the promise the pages make about storing nothing. Download the gap list to keep it.

**Also**

- "Don't know" is treated as its own finding rather than folded into "no". Not knowing whether a protection is on is a different problem from knowing it is off, and usually a cheaper one.
- Answering everything as in place produces pushback rather than congratulation. A self-assessment against plain questions is not a measurement of the running environment, and the framework's entire argument is that the two differ more often than anyone expects.

## 0.8.0 — 2026-07-25

An indicator statement says what must be true. It never said what doing it looks like.

**Added**

- `ontology/guidance.json` — four plain-language answers per indicator: what is actually being asked (phrased so a non-specialist can answer yes, partly, or no), what being able to say yes looks like concretely, what you would hand an assessor, and how the check runs without a person.
- The reference tool leads each indicator with those four rather than with the formal statement. So `KSI-PER-SCR` opens with *"Are people screened before they get access, and does their access actually end when they leave?"* instead of the control language.
- Written for the fifteen indicators a small contractor owns alone under the enclave-only profile. The rest are shared with or inherited from a provider, so the provider drives them, and the tool says so plainly rather than showing a blank. Coverage is reported in the component index instead of being left to discovery.

**Changed**

- Where a control is not fully automatable, the guidance now names what stays human alongside what a machine can read. Six entries described only the query, which reads as though a machine discharges the whole control. The separation-to-revocation join genuinely is one query and catches the most common real breach path — but the screening half is a record somebody files, and saying so is the point.

## 0.7.0 — 2026-07-25

Fifteen tabs across two overlapping pages was the complexity problem made visible. Rebuilt as one page you read and one you look things up in.

**Changed**

- `index.html` is now the whole overview rather than a signpost: the four questions, the one rule about freshness, and an interactive picker that shows what an organisation of a given shape actually owns. It opens with the sentence that was buried three levels down — this does not add requirements.
- `practitioner.html` becomes `reference.html` and drops to five sections: the lattice, measurements, collection, evidence types, and invariants. Start Here, Levels, Trust Center, What You Must Do, and At Three Sizes all lived on the front page too, so they now live there only.
- `explainer.html` is gone, folded into the overview. It carried a full copy of the registry payload it barely used.

**Why**

The catalogue is exhaustive so the model can be correct about any arrangement. The navigation was exposing that structure directly, which asked every reader to walk the whole thing before finding the part that applied to them. Defaulting to your own working set instead of the full catalogue is the actual simplification.

## 0.6.0 — 2026-07-25

Two problems, one of them mine. The prose kept disagreeing with the data, and the whole thing had grown hard to explain.

**Fixed, structurally**

- Every factual error this project shipped had the same shape: a sentence somebody typed sitting next to a number the model computes, with nothing comparing the two. "Eighteen measurements" when there were twenty-two. "36% inherited" when that was one class of four. "Nothing inherited" when the model said four. Adding a test per bug did not fix that, because none of them generalised.
- `tools/claims-lint.mjs` now cross-checks every countable claim in the prose against the registries, and runs as a build gate. It knows the difference between a wrong total and a legitimate subset, and it ignores sentences counting another publication's things — NIST SP 800-171r3 really does have 17 families, and a linter that flags that gets switched off.

**Added**

- [START-HERE](START-HERE.md), one page, no machinery. It leads with the thing that was buried: **this does not add requirements**. The 110 stay exactly as they are; what changes is what you hand over as proof.
- Working sets, computed per shape. The catalogue is exhaustive so the model can be correct about any arrangement, but a 12-person shop inside a rented enclave owns fifteen indicators across nine families, four of them worth automating. The reference is large. The work is not, and conflating the two is a documentation failure rather than a security requirement.
- A check pinning the published working sets to what the model computes, so that table cannot drift either.

## 0.5.0 — 2026-07-25

A scenario claimed nothing was inherited across three commercial clouds. That is wrong, and its own computed figure said so.

**Fixed**

- The three-cloud subcontractor scenario reused the enclave profile despite having no enclave, and its prose contradicted its own arithmetic. A major provider genuinely runs the datacenter, the hypervisor, and the physical destruction of failed drives; no customer re-performs any of that.
- The real answer is more useful than either version. Four indicators are inherited outright and **thirty-three are shared** — the provider is doing substantial work. What a general-purpose commercial arrangement does not do is emit a machine-readable validation about your data on your cadence, so the three-test rule lands that work as shared rather than inherited. That is a statement about evidence flow, not about provider competence.

**Added**

- A third deployment profile, `commercial-cloud`, for controlled information in general-purpose cloud storage and SaaS with no enclave. The difference between it and the enclave-plus-endpoints profile is almost entirely about whether evidence flows, not about who operates what.
- [The five kinds of evidence](docs/08-evidence-types.md), expanded from one line each into what each one proves, where it stops proving anything, three worked examples at different organisation sizes, and the mistake people make with it. A matching view in the practitioner tool.
- Six checks, including one that fails the build if a scenario's prose claims an inheritance level its own figures contradict — the exact bug above, so it cannot return.

## 0.4.1 — 2026-07-25

Written for someone who already knew the model. This release fixes that.

**Changed**

- The ten invariants now explain themselves. Each carries what it means in plain terms, the concrete failure it prevents, a worked example, and how it is enforced in words rather than a filename. A reader should not have to open a source file to find out what a rule does.
- `INV-INDEPENDENCE` referred to a field that no longer exists. It now describes control planes, matching the collection rework.

**Added**

- [The ten rules](docs/06-invariants.md) — the invariants as a readable page, generated from the registry so the two cannot disagree.
- [The same rules at three sizes](docs/07-at-three-sizes.md) and a matching view in the practitioner tool. A 12-person shop working entirely inside a rented enclave, a 200-person manufacturer with laptops that process controlled data, and a subcontractor whose data sits in three clouds. Every figure is computed from the catalogue and the responsibility patterns, so the scenarios move when the model does.
- Four checks that keep the explanation honest: every invariant must carry all four plain-language fields, none of them may point a reader at a filename, the scenario set must cover more than one deployment shape, and the scenario arithmetic must reconcile against the catalogue.

## 0.4.0 — 2026-07-25

Collection was modelled as a list of products. That was a category error, and this release corrects it.

**Changed**

- `ontology/collectors.json` is replaced by `ontology/collection.json`. The old file conflated three separate things: the baseline that defines a requirement, the method used to read state, and the product that happens to implement that method.
- Baselines are criteria sources, not collectors. A secure configuration baseline defines the bar; a tool that ships one is a single implementation that evaluates it. Nine criteria sources are now enumerated separately from the methods that read state.
- Signals list **collection methods** rather than product names. Twelve methods cover the space: API query, pushed event, agent report, log query, config scan, admission control, pipeline gate, outside-in probe, system-of-record query, attested human record, provider-relayed reading, and derived value.
- Independence is now structural. Two readings count as two when they originate from different control planes, which is a property of the method rather than of how many vendors are involved. Five worked examples make the distinction concrete.
- Instance collectors declare their method and control plane, and the build rejects a measurement produced by a method its signal does not accept.

**Added**

- A conformance interface. A collector is anything that emits a reading with the required fields; nothing has to be registered or approved first. Anything meeting the interface is valid, including a script you wrote yourself.
- The `inherited-feed` method, for a validated reading the tenant did not collect. This is the method behind every inherited control, and it was missing.
- The denominator warning, stated as a first-class property of each method: coverage computed against a tool's own inventory measures the tool's visibility, not the estate.

**Removed**

- The recommended and not-recommended product lists. Example implementations remain, grouped by method and labelled as illustrative and incomplete.

## 0.3.1 — 2026-07-25

The explainer and practitioner pages join the repository and are published, with their data bound to the registries rather than copied into them.

**Added**

- `site/` — the [explainer](https://kfcain.github.io/dib-ksi-cmmc/explainer.html) and [practitioner view](https://kfcain.github.io/dib-ksi-cmmc/practitioner.html), published to GitHub Pages. Each page is a single self-contained file that reaches the network zero times once loaded, and stores nothing about the reader.
- Three new views in the practitioner tool: the 22 measurements with their authorities, the 12 collectors that produce them, and the 10 invariants the test suite enforces.
- Deep links. `#lat/KSI-IAM-MFA` opens an indicator, `#sig/SIG-MFA-ENF` a measurement, `#col/ScubaGear` a collector. Opening an indicator updates the address bar, so any view is linkable.
- `tools/gen-pages.mjs` — injects the canonical registries into the pages. CI fails if a page and its registry disagree, so a published page cannot drift from the data it describes.

**Changed**

- The component index reports the enclave split per class rather than as one figure over the full catalogue, which silently assumed Class D.

## 0.3.0 — 2026-07-25

Measurements now cite their sources, and coverage requirements name the subject instead of averaging it away.

**Changed**

- **Coverage requirements are universal.** The seven percentage-based measurements no longer carry an aggregate bar. Every in-scope subject must be covered, and an uncovered subject is permitted only by an exception with a justification and an expiry date. No authority publishes an aggregate percentage, and a percentage hides which subject is uncovered.
- **Eleven measurements now cite an external authority** — CISA's Microsoft 365 secure configuration baseline, the known-exploited vulnerability catalogue, the cryptographic module validation program, and the incident-reporting contract clause. The other eleven are this project's own policy choices and say so per measurement.
- Findings name subjects. A lapsed workstation is reported as `WKS-SHOP-04`, not as a percentage.

**Added**

- `ontology/collectors.json` — twelve real, maintained tools with output formats, licences, and known gaps, including which are not recommended and why.
- Four measurements, all authority-bound: default external sharing posture, standing global administrator count, high-risk sign-in blocking, and email authentication rejection policy. External sharing defaults are the highest-yield confidentiality control in the registry and were previously unmeasured.
- `INV-AUTHORITY` — every measurement cites a source or admits it is a local choice. Enforced by the test suite.
- `INV-UNIVERSAL` — coverage semantics, enforced by the evaluation engine.

**Documentation**

- Enclave inheritance is stated per class (30% at A, 35% at B and C, 36% at D) instead of quoting the full-catalogue figure without saying it assumes Class D.
- Named a property of the class ladder: work the tenant owns alone stays nearly flat across classes while shared work grows, so climbing a class deepens proof on shared work rather than adding solo work.

## 0.2.0 — 2026-07-19

First public draft of the ontology and the executable framework.

**Added**

- Five-layer ontology (obligation, data, people/process/technology, signal, assurance) with 26 entity types, 22 relations, and 8 enforced invariants.
- Signal registry: 18 measurable indicators with published denominators, collection methods, per-class thresholds, and cadence.
- Responsibility patterns: a mode for all 64 KSIs under two defended-enclave deployment profiles, plus the three-test inheritance rule.
- Requirement-level exception policy, shipped with a status flag stating that its default set requires confirmation against the current rule text.
- Worked instance: a synthetic forty-person manufacturer on the enclave-only pattern, built to be realistic rather than green.
- Tooling: validator, projection engine (seven projections), consolidated-dataset generator, component-index generator, prose linter, one verification script both humans and CI run, and a 47-test suite in which every invariant carries a negative case.

**Established**

- `INV-PROJECTION`: no deliverable is stored. The security decision record, responsibility matrix, finding queue, access review, and legacy system security plan are all computed.
- `INV-SIGNAL`: a claim is met only while supporting measurement exists inside the cadence window.
- `INV-INHERITANCE`: inheritance is re-tested at every ingest and degrades automatically on failure.

**Known limits**

- Signal thresholds are proposed defaults pending published organization-defined parameters.
- The exception-eligibility default set is unconfirmed against the current rule text.
- Eighteen indicators cover the automatable core; 23 of 64 KSIs are not automatable and are demonstrated through other evidence types.

## 0.1.x — earlier

Catalog development prior to the ontology: 64 KSIs across 16 families, the assurance-class model, the operating model and stress test, the finding-queue design, and the assessment-agent specification. Recorded in the catalog's own changelog and in the specification documents under [docs/](docs/).
