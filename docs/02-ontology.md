# How the information is organized

Reference for the structure underneath the four questions.

The point of modeling this carefully is narrow: record the facts once, with enough context that any report someone asks for is a query rather than a writing project. Record them without that context and every new form is another document to author and then keep in sync with reality.

That is the difference between a program that survives a rule change and one that starts over each time.

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

**The indicator is the validation and reporting unit.** It is what gets collected, published, and discussed — and it is met only when every objective it validates is demonstrated.

Collapsing these two is the most common modeling error in compliance tooling, and it produces the failure where an indicator reads green while an objective underneath it was never demonstrated. The ontology keeps them as separate entity types joined by an explicit `validates` relation for exactly that reason.

## The invariants

Eight rules the validator enforces. Each has a negative test that fails without it.

| Invariant | Statement |
|---|---|
| **INV-GRADING** | An indicator is met only when every objective it validates is demonstrated by the evidence types its class requires. |
| **INV-PROJECTION** | Every deliverable is a projection. No deliverable entity type exists, and no view may contain a fact not derivable from the graph. |
| **INV-SIGNAL** | A claim on an automatable objective is met only while support exists inside the cadence window. Past it, the claim is stale. |
| **INV-INHERITANCE** | An objective may be marked inherited only when all three tests pass. A failed test degrades the assignment; it never silently stands. |
| **INV-ACCESS** | Every controlled data asset carries at least one access grant, and every grant a stated basis and a current review. |
| **INV-MINIMIZATION** | Every controlled data asset carries a necessity record naming why the data is held. |
| **INV-INDEPENDENCE** | Two measurements from collectors in the same independence group are one method, not two. |
| **INV-HUMAN** | Attestation, adjudication, categorization confirmation, and risk acceptance resolve to a named person, bound by hash to the state signed. |

INV-PROJECTION is the one that shapes the repository. There is no `sdr` field and no `responsibility_assignments` array in the worked instance — the tests assert their absence. Everything a reader would expect to find stored is computed at read time, which is why regenerating a deliverable after a configuration change is the only way it ever changes.

## Independence, and why it is modeled

At the higher assurance classes an indicator needs two independent automated methods. "Independent" is easy to claim and easy to fake: two queries against the same control plane look like two methods and are one. Each collector therefore declares an `independence_group`, and the derivation counts distinct groups rather than distinct queries. The worked instance is short of a second method on twenty-three indicators, and the posture projection reports that as the delta to the next class rather than hiding it.

## Where the ontology deliberately stops

It carries no normative standard text. Objectives and requirements are referenced by identifier and the reader is pointed at the published source. The framework is a way of organizing obligations, not a republication of them.

It also carries no scoring algorithm of its own. Class is computed from evidence depth, method independence, cadence compliance, and history depth — all of which are properties of the graph — and the result is a statement of the form "this environment proves this level at this class today, and the delta to the next class is these indicators." What a program office chooses to do with that statement is a policy question the ontology does not try to answer.
