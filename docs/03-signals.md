# What gets measured

Reference for question three, *are the protections actually on*, and question four, *how fast would you know if one stopped*.

Twenty-two measurements are defined in [`ontology/signals.json`](../ontology/signals.json). They are not a complete control set and were never meant to be. They cover the parts of CUI confidentiality a machine can check continuously: who can authenticate, what is watching the endpoints, what is encrypted, what is exposed, and what has gone quiet. The full list — with authority, shape, and the KSIs each validates — is generated into [COMPONENTS.md](../COMPONENTS.md); the registry file is the source of truth for thresholds and cadence.

## What every indicator carries

**A published denominator.** Every coverage reading publishes `{measured, total}` computed against the asset inventory, never against the tool's own view. A measurement without one is rejected by the validator. This is the check that stops "ninety-eight percent of the endpoints the agent already knows about."

**A requirement, not a percentage.** Coverage measurements are universal: the requirement applies to every in-scope subject, and an uncovered subject is permitted only by an exception carrying a justification and an expiry date. No authority publishes an aggregate percentage — CISA, CIS, the Defense Information Systems Agency and Microsoft all use per-item pass or fail plus documented exceptions — and a percentage hides the thing you need, which is *which* subject is uncovered.

**An authority, or an admission.** Every measurement either cites an external source for its requirement or is flagged as this project's own policy choice with a rationale. Eleven do the former, eleven the latter. The test suite fails if a measurement does neither.

**A method, not a product.** The *criteria source* says what good looks like: a configuration baseline, a benchmark, a vulnerability catalogue, a contract clause, or your own documented policy. The *collection method* is how the state is retrieved. The *implementation* is whatever you happen to run. Naming products would date the registry inside a release cycle and exclude every environment that made a different choice, so each measurement lists the methods that can legitimately produce it and stops there. Anything that emits a conforming reading is a valid collector, including a script you wrote yourself. See [`ontology/collection.json`](../ontology/collection.json) for the interface and the assurance properties of each method.

**A cadence.** The maximum age of the newest supporting measurement before the claim it supports goes stale. Annual at Class A, monthly at B, every three days at C, daily at D.

**An evidence type.** Most indicators are machine telemetry. Time to detect, time to contain, restore-to-objective, and reporting-path exercise are demonstrations, because they are properties of an exercised capability rather than of a queried configuration.

## Thresholds are proposed, not settled

Every locally chosen value is a default published for adversarial comment. Where the department has issued an organization-defined parameter, that value governs and the default is replaced. The registry is the carrier of a threshold, never its authority.

## How a signal becomes a finding

A measurement that misses its bar produces a threshold breach. A measurement that ages past its cadence produces a stale claim. An indicator required at the tenant's class that has never been measured produces a coverage gap. Each is generated from the graph; none is authored.

Findings join to the objectives their indicator validates, and objectives join to requirements. Exception eligibility binds at the requirement level, so the engine refuses a clock for any objective under an ineligible requirement regardless of which indicator carried it. The worked instance shows the computation running across 31 findings.
