# The ten rules the model enforces on itself

Most security frameworks are lists of things you ought to do. These are ten properties the model holds true about *itself* — no matter what anyone types into it, because the software refuses to produce a result that breaks one.

That distinction matters more than it sounds. A rule you can override under deadline pressure is a suggestion. If you cannot mark something as handled by your provider unless three specific conditions are true, you cannot quietly get that wrong at 4pm on a Friday. The rule does the remembering instead of you.

**What "enforced" means.** Each rule has an automated check. Every change to this repository runs all of them, and a change that breaks one is rejected rather than published — the same way a spreadsheet refuses to show a total when a formula points at a deleted cell. Nobody has to notice the violation for it to be caught.


## INV-GRADING

**You do not get credit for a protection by saying you have it. The system works out whether you have met it from the evidence underneath, one assessment objective at a time.**

*What goes wrong without it.* Self-graded compliance. A summary page reads MET while nothing underneath actually supports it, which is the failure mode of every checklist ever filled in the night before an audit.

*In practice.* A shop marks access control as handled. The model does not accept the assertion. It checks each objective the indicator covers, finds one with no supporting evidence, and reports the indicator as not met — naming the objective that failed.

*How it is enforced.* Status is always computed from the evidence. There is no field anywhere in the model that lets a status be typed in directly.

<details><summary>The formal statement, for anyone implementing this</summary>

A KSI is MET only when every assessment objective it validates is demonstrated by the evidence types its assurance class requires. The objective is the grading unit; the KSI is the validation and reporting unit.

Implementation: `validator: ksi_status derived from claims, never asserted directly`

</details>

## INV-UNIVERSAL

**Every in-scope thing has to be covered. There is no passing score below all of them — but there is a documented exception with a name, a reason, and an expiry date.**

*What goes wrong without it.* Ninety-seven percent coverage forever, with the same three machines uncovered every quarter, because nobody can see which three they are.

*In practice.* A 12-person shop with one uncovered laptop and a 400-person firm with twelve are held to the same rule. Both must name the specific machines. The small shop fixes it that afternoon; the large one files dated exceptions for the four awaiting replacement and fixes the other eight.

*How it is enforced.* A reading that leaves a subject uncovered must carry an exception naming that subject, giving a reason, and carrying a future expiry date. An expired exception stops working on its expiry date without anyone intervening.

<details><summary>The formal statement, for anyone implementing this</summary>

A coverage requirement applies to every in-scope subject. An uncovered subject is permitted only by a justified, dated exception that has not expired. No aggregate percentage is published, because no authority publishes one.

Implementation: `tools/lib.mjs — coverage evaluation; an unjustified or expired exception breaches the signal`

</details>

## INV-PROJECTION

**Every report is generated from the same underlying data. Nothing is typed by hand into a deliverable.**

*What goes wrong without it.* The security plan says one thing, the remediation tracker says another, and the responsibility matrix says a third — all describing the same environment, all edited at different times by different people.

*In practice.* Reclassify one folder as controlled information. The responsibility matrix, the remediation list, the dataflow diagram, and the decision record all change together, because each is computed from that same fact rather than transcribed from it.

*How it is enforced.* There is no deliverable stored anywhere in the model. Reports exist only as computations over the graph, so a report cannot contain a fact the graph does not hold.

<details><summary>The formal statement, for anyone implementing this</summary>

Every deliverable is a projection over this graph. The Security Decision Record, the responsibility matrix, the POA&M, the dataflow diagram, and the affirmation package are views — none is a source, and none may contain a fact that is not derivable from entities and relations.

Implementation: `validator: no deliverable entity type exists; projections are computed by tools/project.mjs`

</details>

## INV-SIGNAL

**A claim is only good while the reading behind it is fresh. Past its shelf life it reports stale — not passing, not failing.**

*What goes wrong without it.* Documents that age into truth. A statement written in March still reads as current in December, and nothing in the process ever asks whether it still is.

*In practice.* Multi-factor enforcement is verified in March against a 30-day window. Through April the claim holds. In May, with no new reading, it goes stale on its own — nobody has to notice or decide to admit it.

*How it is enforced.* Each measurement declares how long a reading stays good, per assurance class. The claim is compared against the newest supporting reading every time anything is computed.

<details><summary>The formal statement, for anyone implementing this</summary>

A claim on an automatable objective is met only while a supporting measurement exists inside the class cadence window. When the newest support ages past the window the claim becomes stale, not met. Documents cannot age into truth.

Implementation: `validator: freshness check against Indicator.cadence_days for the tenant class`

</details>

## INV-INHERITANCE

**You only get to say your provider handles something when three things are true at once, and the model re-checks all three every time rather than taking your word for it.**

*What goes wrong without it.* Inheritance by assumption, which is the most common way an enclave arrangement fails. A tenant believes the provider covers something; the provider believes it is the tenant’s; nobody is doing it.

*In practice.* A provider covers disk encryption for everything inside the enclave. But a tenant setting still permits download to local machines, so the third test fails and the assignment degrades from inherited to shared automatically. The tenant did not have to spot it.

*How it is enforced.* Three tests: the provider’s authorization actually covers it, the provider sends a machine-readable validation on your cadence, and no setting on your side overrides it. Failing any one degrades the claim rather than leaving it standing.

<details><summary>The formal statement, for anyone implementing this</summary>

A tenant may mark an objective inherited only when all three tests pass: the provider's authorization covers it, the provider emits a machine-readable validation for it on the tenant's class cadence, and no tenant-side configuration overrides it. A failed test degrades the assignment to shared or tenant; it never silently stands.

Implementation: `validator: three-test rule on every ResponsibilityAssignment with mode inherited`

</details>

## INV-ACCESS

**Everyone who can reach controlled information has a stated reason for that access and a date when someone last confirmed the reason still holds.**

*What goes wrong without it.* Access that accumulates. People change roles, projects end, contractors leave, and the permissions stay — the single most common path into these environments.

*In practice.* An engineer moved off a program eight months ago. Their access record has no reviewed date inside the window, so it surfaces as a finding rather than waiting for an annual review to catch it.

*How it is enforced.* Every piece of controlled information must have at least one access grant, and every grant must carry a basis and a review date inside the review window.

<details><summary>The formal statement, for anyone implementing this</summary>

Every data asset classified CUI carries at least one access grant, and every access grant carries a stated basis and a review date inside the review window. Access without a basis is a finding.

Implementation: `validator: unjustified_access finding generation`

</details>

## INV-MINIMIZATION

**Every piece of controlled information you hold has to have a reason to be here, and a date when that reason was last checked.**

*What goes wrong without it.* Scope that only grows. Old programs, superseded drawing revisions, an attachment from 2021 — each one adding cost and risk while protecting nothing.

*In practice.* A closed contract’s drawing package has no current necessity record, so it is flagged. Deleting it removes the folder from scope altogether — there is then nothing to encrypt, nobody whose access needs reviewing, and no monitoring to keep running.

*How it is enforced.* Controlled information without a stated need is reported as a finding. This is the only rule here that removes risk rather than managing it.

<details><summary>The formal statement, for anyone implementing this</summary>

Every data asset classified CUI carries a necessity record naming why the data is held and when that was last reviewed. Data held without a stated need is a finding, because the cheapest control is not holding the data.

Implementation: `validator: unnecessary_data finding generation`

</details>

## INV-INDEPENDENCE

**Two readings from the same place are one reading. Buying a second tool that asks the same system the same question does not give you a second opinion.**

*What goes wrong without it.* The appearance of corroboration without any. Two products, one blind spot, and a shared failure nobody can see from inside either of them.

*In practice.* Querying an identity system directly and running a second tool that queries the same identity system is one reading, twice. Pairing that identity query with a log platform holding authentication records is genuinely two, because the log platform would have to be independently wrong to agree.

*How it is enforced.* Each collector declares which control plane it reads from. Readings only count separately when those differ. Required from assurance Class C upward.

<details><summary>The formal statement, for anyone implementing this</summary>

Two measurements read from the same control plane do not count as two independent methods for Class C and above.

Implementation: `validator: collector control_plane distinctness check`

</details>

## INV-HUMAN

**A person signs. Nothing computed ever substitutes for that signature, and the signature is bound to the exact state that was signed.**

*What goes wrong without it.* Accountability that dissolves into the system. Everyone points at the dashboard and nobody has actually accepted the risk.

*In practice.* The environment changes after an attestation is signed. The signature no longer matches the current state, so it does not carry forward. Someone has to look at what changed and sign again.

*How it is enforced.* Attestation, adjudicating a finding, confirming what counts as controlled information, and accepting risk each resolve to a named person, and each signature is bound by hash to the posture it covers.

<details><summary>The formal statement, for anyone implementing this</summary>

Attestation, adjudication, categorization confirmation, and risk acceptance resolve to a named Person. No computed state substitutes for a signature, and every signature binds by hash to the exact posture signed.

Implementation: `validator: Attestation.posture_hash required and non-empty`

</details>

## INV-AUTHORITY

**Every number either cites where it came from, or openly admits it is this project’s own judgment. There is no third option.**

*What goes wrong without it.* Invented precision. A threshold that looks authoritative, gets quoted, gets built into somebody’s contract, and traces back to nothing at all.

*In practice.* The standing administrator count cites a published baseline that sets a floor of two and a ceiling of eight. The detection-time target cites nothing, because no authority publishes one, so it is labelled as our judgment with the reasoning attached. Eleven of the twenty-two measurements fall on each side.

*How it is enforced.* A measurement must carry either a citation to an external source or a written rationale for the choice. One with neither stops the build.

<details><summary>The formal statement, for anyone implementing this</summary>

Every measurement either cites an external authority for its requirement, or is explicitly marked as this project’s own policy choice with a stated rationale. A number with no stated origin is not allowed.

Implementation: `tools/test.mjs — INV-AUTHORITY block; the suite fails if any signal has neither an authority nor a local-policy rationale`

</details>

## Where these come from

The rules are held as data in [`ontology/dib-ksi-ontology.json`](../ontology/dib-ksi-ontology.json), not as prose in this file. This page is generated from that file, so the two cannot disagree.
