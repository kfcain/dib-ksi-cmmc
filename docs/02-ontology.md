# How the information is organized

Reference for the structure underneath the four questions. The facts are recorded once, with enough context that any report is a query rather than a writing project.

## The five layers

| Layer | Holds | Question it answers |
|---|---|---|
| **L0 Obligation** | Authority, Requirement, AssessmentObjective, KSI, KSIFamily | What does the law and the standard require? Identical for every tenant, published and versioned. |
| **L1 Data** | DataType, DataAsset, DataFlow, Boundary, Enclave | What data exists, why is it held, where does it live, how does it move? |
| **L2 People, process, technology** | Party, Person, Role, Process, Component, AccessGrant | What safeguards it, and who can reach it? |
| **L3 Signal** | Indicator, Measurement, Collector, Threshold, Finding | What is actually running, measured how, against what bar? |
| **L4 Assurance** | Claim, EvidenceRef, ResponsibilityAssignment, Exception, Attestation | What is claimed, by whom, on what support, signed by which human? |

Obligation sits at the top because it is the same for everyone. Data sits directly beneath it because obligation attaches to data. Everything below exists only because of what sits above it, which is what keeps scope from growing on its own.

## Two units, never confused

**The assessment objective is the grading unit.** Every status the framework reports resolves to an objective.

**The indicator (KSI) is the validation and reporting unit.** It is what gets collected, published, and discussed, and it is met only when every objective it validates is demonstrated.

Collapsing the two produces the failure where an indicator reads green while an objective underneath it was never demonstrated. The ontology keeps them as separate entity types joined by an explicit `validates` relation.

## Deliverables are projections

The Security Decision Record, the responsibility matrix, the POA&M, the dataflow diagram, and the affirmation package are queries over the graph, never stored. There is no `sdr` field in the worked instance; the tests assert its absence. Regenerating a deliverable after a configuration change is the only way it ever changes. The projection list is in [COMPONENTS.md](../COMPONENTS.md), with the commands in [AGENTS.md](../AGENTS.md).

## Independence, and why it is modeled

At the higher assurance classes an indicator needs two independent automated methods. "Independent" is easy to claim and easy to fake: two queries against the same control plane look like two methods and are one. Each collector therefore declares an `independence_group`, and the derivation counts distinct groups rather than distinct queries. Where the worked instance is short of a second method, the posture projection reports the shortfall as the delta to the next class rather than hiding it.

## The rules the validator enforces

Ten invariants, each with a negative test that fails without it: [05-invariants](05-invariants.md), or generated with source references in [COMPONENTS.md](../COMPONENTS.md).

## Where the ontology deliberately stops

It carries no normative standard text: objectives and requirements are referenced by identifier, and the reader is pointed at the published source. It carries no scoring algorithm: class is computed from evidence depth, method independence, cadence compliance, and history depth, and the result is a statement of the form "this environment proves this level at this class today, and the delta to the next class is these indicators." What a program office does with that statement is a policy question the ontology does not answer.
