# The ten rules the validator enforces

Ten properties the model holds about itself regardless of what anyone types into it. Each has an automated check that runs on every change to this repository, and a change that breaks one is rejected rather than published.

The source of record is the `invariants` block of [`ontology/dib-ksi-ontology.json`](../ontology/dib-ksi-ontology.json); the formal statements below are copied from it, and the generated table in [COMPONENTS.md](../COMPONENTS.md) is rebuilt from it on every change.

## INV-GRADING

**You do not get credit for a protection by saying you have it.**

*Formal.* A KSI is MET only when every assessment objective it validates is demonstrated by the evidence types its assurance class requires. The objective is the grading unit; the KSI is the validation and reporting unit.

*Enforced.* Status is always derived from claims and evidence. No field anywhere in the model lets a status be typed in directly.

## INV-UNIVERSAL

**Every in-scope subject must be covered. There is no passing score below all of them — only a justified, dated exception.**

*Formal.* A coverage requirement applies to every in-scope subject. An uncovered subject is permitted only by a justified, dated exception that has not expired. No aggregate percentage is published, because no authority publishes one.

*Enforced.* Coverage evaluation in `tools/lib.mjs`; an unjustified or expired exception breaches the signal.

## INV-PROJECTION

**Every report is generated from the same underlying data. Nothing is typed by hand into a deliverable.**

*Formal.* Every deliverable is a projection over this graph. The Security Decision Record, the responsibility matrix, the POA&M, the dataflow diagram, and the affirmation package are views — none is a source, and none may contain a fact that is not derivable from entities and relations.

*Enforced.* No deliverable entity type exists; projections are computed by `tools/project.mjs`.

## INV-SIGNAL

**A claim is only good while the reading behind it is fresh. Past its shelf life it reports stale — not passing, not failing.**

*Formal.* A claim on an automatable objective is met only while a supporting measurement exists inside the class cadence window. When the newest support ages past the window the claim becomes stale, not met. Documents cannot age into truth.

*The window* is each indicator's `cadence_days` for the tenant's class, set in [`ontology/signals.json`](../ontology/signals.json): annual at Class A down to daily at Class D for machine readings.

*Enforced.* Freshness check against the indicator cadence for the tenant class.

## INV-INHERITANCE

**You may say your provider handles something only while three tests all pass, and the model re-checks them at every ingest.**

*Formal.* A tenant may mark an objective inherited only when all three tests pass: the provider's authorization covers it (T1, fails to tenant), the provider emits a machine-readable validation for it on the tenant's class cadence (T2, fails to shared), and no tenant-side configuration overrides it (T3, fails to tenant). A failed test degrades the assignment to shared or tenant; it never silently stands.

*Enforced.* Three-test rule on every responsibility assignment with mode inherited. The full test table and failure modes are in [04-enclave-pattern](04-enclave-pattern.md).

## INV-ACCESS

**Everyone who can reach CUI has a stated reason for that access and a current review.**

*Formal.* Every data asset classified CUI carries at least one access grant, and every access grant carries a stated basis and a review date inside the review window. Access without a basis is a finding.

*The review window* is `SIG-ACC-REVIEW`'s cadence for the tenant's class: 365 days at Class A, 90 at B, 30 at C and D.

*Enforced.* Unjustified-access finding generation.

## INV-MINIMIZATION

**Every piece of CUI held has a reason to be here and a date that reason was last checked.**

*Formal.* Every data asset classified CUI carries a necessity record naming why the data is held and when that was last reviewed. Data held without a stated need is a finding, because the cheapest control is not holding the data.

*Enforced.* Unnecessary-data finding generation.

## INV-INDEPENDENCE

**Two readings from the same place are one reading.**

*Formal.* Two measurements read from the same control plane do not count as two independent methods for Class C and above.

*A control plane* is the platform a reading originates from. Two queries against the same platform are one reading, however different the tools issuing them; [`ontology/collection.json`](../ontology/collection.json) names the plane for each collection method.

*Enforced.* Collector control-plane distinctness check.

## INV-HUMAN

**A person signs, and the signature binds to the exact state signed.**

*Formal.* Attestation, adjudication, categorization confirmation, and risk acceptance resolve to a named Person. No computed state substitutes for a signature, and every signature binds by hash to the exact posture signed.

*Enforced.* Attestation `posture_hash` required and non-empty; an unsigned attestation is reported as unsigned.

## INV-AUTHORITY

**Every number either cites where it came from, or openly admits it is this project's own judgment. There is no third option.**

*Formal.* Every measurement either cites an external authority for its requirement, or is explicitly marked as this project's own policy choice with a stated rationale. A number with no stated origin is not allowed.

*Enforced.* The test suite fails if any signal has neither an authority nor a local-policy rationale.
