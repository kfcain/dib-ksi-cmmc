# The five kinds of evidence

Five kinds of evidence, ordered by how hard they are to fake and how much work they are to produce. Assurance classes differ mainly in which of these they accept: lower classes take an assertion backed by configuration, higher classes want telemetry and a demonstration.

## E1 — Machine telemetry

A reading taken directly from the running system, by querying its live state rather than describing it.

**What makes it strong.** It reflects what is true at the moment of the query, cannot be backdated, and can be re-taken by somebody else who will get the same answer.

**Where it stops proving anything.** It says nothing about what was true yesterday, and it inherits the blind spots of whatever produced it. A reading that covers only the assets the tool already knows about is measuring the tool.

**The mistake people make.** Presenting a dashboard screenshot as telemetry. A screenshot is a picture of a reading, not the reading, and nobody can re-derive it.

## E2 — Provenanced artifact

A document or export that carries proof of where it came from and that it has not been altered since — a signature, a hash chain, a trusted timestamp. Best when it originates from somebody other than the party being assessed.

**What makes it strong.** It survives the passage of time and the departure of the person who produced it. A third-party-originated artifact is the hardest kind of evidence to quietly improve.

**Where it stops proving anything.** It is true as of its date and silent afterward. It proves the artifact is intact, not that its contents were correct when written.

**The mistake people make.** Treating a vendor's compliance certificate as covering your usage. Certificates cover a defined service in a defined configuration, and the thing you bought may sit outside it.

## E3 — Bound intent

A short policy statement wired to the configuration that enforces it, so the rule and its enforcement point at each other.

**What makes it strong.** It closes the oldest gap in compliance, where the written policy and the running system drift apart for years without anyone noticing.

**Where it stops proving anything.** It proves the rule is wired up, not that the wiring covers everything. A policy bound to one system and silent about three others looks identical from the policy side.

**The mistake people make.** Writing the policy and the configuration separately and asserting they agree. If nothing breaks when they diverge, they will diverge.

## E4 — Human observation

Somebody looked, asked, or walked the floor, and wrote down what they found: interviews, walkthroughs, physical inspections.

**What makes it strong.** It reaches everything no query can see: whether people understand the rule, whether the shortcut everyone takes matches the documented process, whether the locked room is actually locked.

**Where it stops proving anything.** It does not scale, it is a snapshot, and its quality depends entirely on who did the looking and what they wrote down.

**The mistake people make.** Recording the conclusion without the observation. "Confirmed compliant" is not evidence; what the observer saw, on what date, is.

## E5 — Demonstration

The capability is exercised under realistic conditions and the results are measured. Not a description of what would happen — a record of what did.

**What makes it strong.** It is the only evidence that distinguishes a capability that exists from one that works. Restore procedures and incident reporting paths fail here constantly.

**Where it stops proving anything.** Expensive, and easy to stage into meaninglessness. A restore test against a small file on a good day proves less than the effort suggests.

**The mistake people make.** Running the demonstration and recording only that it passed. The measured result is the evidence, and a failed demonstration honestly recorded is worth more than a staged success.

## What each class accepts

From `class_rules` in [`ontology/ksi-catalog.json`](../ontology/ksi-catalog.json):

| Class | Automatable indicators | Physical / procedural indicators | Machine cadence | History |
|---|---|---|---|---|
| A | MAY automate; E3 bound intent + signed attestation | E3 + one provenanced artifact (E2) | at affirmation | none |
| B | SHOULD automate; at least one automated method (E1) + one other type | E2 + E3 | monthly | 30 days |
| C | MUST automate; two independent automated methods (E1, distinct control planes) + E3 | two non-machine types (E2 + E4/E5); E2 third-party-originated where one exists | every 3 days | 6 months |
| D | MUST automate; four methods including one adversarial E5 | three types including exercised E5 + in-person E4 | daily, enforce on drift | 18 months |

Higher classes do not ask for more paperwork; they ask for evidence further down the list, fresher, with more history behind it. A class that accepts bound intent alone is asking whether you set it up. A class that wants telemetry plus a demonstration is asking whether it still works and whether you have proved it recently.
