# What gets measured

Reference for question three, *are the protections actually turned on*, and question four, *how fast would you know if one stopped*.

Twenty-two measurements are defined in `ontology/signals.json`. They are not a complete control set and were never meant to be. They cover the parts of confidentiality that a machine can check continuously: who can authenticate, what is watching the endpoints, what is encrypted, what is exposed, and what has gone quiet.

## What every indicator carries

**A published denominator.** Every percentage publishes `{measured, total}`. A measurement without one is rejected by the validator, because a coverage number over an undefined population is not a measurement. This is the check that stops "ninety-eight percent of the endpoints the agent already knows about."

**A method.** How the value is produced, and against which authoritative source. Coverage is computed against the asset inventory, never against the tool's own view of the world.

**A requirement, not a percentage.** Coverage measurements are universal: the requirement applies to every in-scope subject, and an uncovered subject is permitted only by an exception carrying a justification and an expiry date. This is deliberate. No authority publishes an aggregate percentage — CISA, CIS, the Defense Information Systems Agency and Microsoft all use per-item pass or fail plus documented exceptions — and a percentage hides the thing you need, which is *which* subject is uncovered.

**An authority, or an admission.** Every measurement either cites an external source for its requirement or is flagged as this project's own policy choice with a rationale. Eleven do the former, eleven the latter. The test suite fails if a measurement does neither, so the distinction cannot quietly erode.

**A method, not a product.** Three things get confused constantly, and an earlier version of this framework confused them too.

The *criteria source* says what good looks like — a secure configuration baseline, a benchmark, a hardening guide, a vulnerability catalogue, a contract clause, or your own documented policy. The *collection method* is how the state is actually retrieved. The *implementation* is whatever you happen to run.

A baseline is not a collector. A tool that ships a baseline is not the same thing as the baseline it ships. Naming products per measurement would date this framework inside a release cycle and would quietly exclude every environment that made a different choice, so each measurement lists the methods that can legitimately produce it and stops there. Twelve methods cover the space: authenticated API queries, pushed events, agent self-reports, log queries, configuration scans, admission-control decisions, pipeline gates, outside-in probes, system-of-record queries, attested human records, provider-relayed readings, and values derived from other readings.

What the framework is definitive about is the shape of the reading. Anything that emits a conforming one is a valid collector, including a script you wrote yourself. See [`ontology/collection.json`](../ontology/collection.json) for the interface and the assurance properties of each method.

**A cadence.** The maximum age of the newest supporting measurement before the claim it supports goes stale. At the lowest class that is annual, at the next monthly, then every three days, then daily.

**An evidence type.** Most indicators are machine telemetry. Time to detect, time to contain, restore-to-objective, and reporting-path exercise are demonstrations, because they are properties of an exercised capability rather than of a queried configuration.

## The eighteen

| Indicator | Unit | Class C bar | Why it is here |
|---|---|---|---|
| Phishing-resistant MFA enforcement | percent | ≥ 99 | Authentication failure dominates third-party compromise |
| Privileged-account MFA enforcement | percent | 100 at every class | No class tolerates an unprotected privileged account |
| Endpoint detection coverage | percent | ≥ 98 | Unmonitored endpoints are where dwell time accumulates |
| Audit log shipping coverage | percent | ≥ 98 | A log that never arrives is not a log |
| Remediation latency, internet-facing | days | ≤ 14 | Measured from detection, not from ticket creation |
| Remediation latency, internal | days | ≤ 30 | The same discipline, a longer clock |
| Open known-exploited vulnerabilities | count | 0 | The clearest single statement a posture makes about itself |
| Time to detect | hours | ≤ 24 | Dwell time is the number the losses track |
| Time to contain | hours | ≤ 12 | Detection without containment is a notification |
| Validated cryptography coverage | percent | 100 at every class | A floor, not a target |
| Cryptographic module validation status | count | 0 | A module leaving active status is a clocked event |
| Access review currency | percent | ≥ 98 | Who has access, reviewed when |
| Dormant and orphaned accounts | count | 0 | Joined to personnel records, so a separated employee's live account is a finding |
| Undeclared flow detections | count | 0 | Keeps the declared scope honest against telemetry |
| Provider validation feed freshness | days | ≤ 3 | The second inheritance test, expressed as a measurement |
| Restore demonstrated to objective | days | ≤ 90 | A backup never restored is a hypothesis |
| Incident reporting path exercised | days | ≤ 180 | The obligation attaches at every class, so the exercise does too |
| Role-based training currency | percent | ≥ 98 | Never inheritable — the provider trains its own people |

## Thresholds are proposed, not settled

Every value above is a default published for adversarial comment. Where the department has issued an organization-defined parameter, that value governs and the default is replaced. The registry is the carrier of a threshold, never its authority, and the framework says so in the file rather than in a footnote.

The most useful contribution anyone can make to this registry is a threshold they can demonstrate is wrong — too loose to matter, too tight to achieve, or measuring the wrong population.

## How a signal becomes a finding, and a finding becomes a clock

A measurement that misses its bar produces a threshold breach. A measurement that ages past its cadence produces a stale claim. An indicator required at the tenant's class that has never been measured produces a coverage gap. Each is generated from the graph; none is authored.

Findings then join to the objectives their indicator validates, and those objectives join to requirements. Exception eligibility binds at the requirement level, so the engine refuses a clock for any objective sitting under an ineligible requirement regardless of which indicator carried it. That is a computation, not a negotiation, and the worked instance shows it running across thirty findings.
