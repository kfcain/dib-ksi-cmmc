# Why this exists

## The thing being protected

A prime contractor sends a machine shop a set of technical drawings. The shop makes the part. That drawing package is the reason an adversary is interested in a 40-person business in Ohio.

This is a confidentiality problem. Not primarily availability, not primarily integrity. If someone reads the drawings, the damage is done whether or not the shop's systems ever go down, and no recovery plan undoes it. That framing matters because it tells you where to spend: on who can reach the information and whether the barriers around it are actually up, rather than on the resilience of a machine shop's file server.

It also tells you the cheapest control. The shop that never received a drawing it didn't need has nothing to protect. Scope reduction is not a compliance trick — it is the only control that removes risk instead of managing it.

## The four questions

Strip the vocabulary away and defending controlled information is four questions:

1. **What sensitive information do you have, and could you have less?**
2. **Who can reach it?**
3. **Are the protections actually turned on right now?**
4. **If one turns off, how fast do you find out?**

Every serious loss in this sector traces to one of those. Credentials stolen and reused. An endpoint nobody was watching. An attacker resident for months because the answer to question four was "eventually, if someone happens to look."

The 2026 Verizon DBIR put third-party involvement at 48% of breaches, up from 30% the prior year, driven mostly by authentication failures rather than exotic exploitation. Only 23% of those third parties had fully remediated missing or misconfigured MFA. That is question two and question three going unanswered at scale.

## Why the current answer is a document

Here is the part worth understanding, because it explains the mess without blaming anyone in it.

A contract clause can require a document by a date. It cannot easily require that you notice an intruder within a day, because nobody can verify that at the moment of signature, and a term you cannot verify is a term you cannot enforce.

So every attempt to make security contractual produced artifacts. Not because anyone preferred paperwork to security, but because paperwork is what a procurement vehicle knows how to accept, count, and litigate. Ask an acquisition system to enforce an outcome and it hands you back a deliverable.

Run that loop since 2016 and you get what we have: self-attestation, then a maturity model, then a smaller maturity model, then a phased rollout, then a suspension for review in 2026 citing cost and overhead. Through all of it the artifact at the center never changed. A System Security Plan describes an intended design, is written once, and is graded by a human reading prose.

A document is true on the day it is written and silent afterward, while appearing to speak for the whole year.

## What changed

**FedRAMP shipped a working alternative.** Its 2026 ruleset moved cloud authorization toward Key Security Indicators — named, measurable properties with machine validation, replacing screenshots and narrative. Whatever you think of the execution, the direction is right and the pattern is already published. It does not need inventing.

**The CMMC rollout paused.** A review opened because the program cost too much and moved too slowly. Treating that as breathing room is the wrong read. It is a request for a different answer, and proposing the same artifact on a shorter timeline is not one.

## The bet

Answer the four questions with measurements of the running environment, and give every measurement a shelf life.

That second half does most of the work. A claim backed by a measurement is only good while the measurement is fresh; past its window the claim reports **stale** rather than passing. Nobody has to decide to admit the environment drifted, because drift shows up on its own.

Confidentiality fails quietly. An MFA exemption granted for one contractor and never revisited. A share opened for a vendor during a rush. An endpoint agent that stopped reporting in March. None of those announce themselves, and none of them are visible in a document written before they happened.

## Where it lands for a small contractor

Follow it through and the practical advice is not "implement 110 controls." It is: stop holding the drawings on your own network.

Rent a defended enclave, work through a thin client, and let the provider run the infrastructure controls it already runs. The barrier keeping small firms out of defense work was never the assessment fee, it was standing up a defensible environment from nothing. Renting one changes that from a construction project into a subscription.

The security argument runs the same direction. Controlled information concentrating into a few well-watched environments beats it scattered across thousands of under-resourced ones.

The model puts a number on it: with nothing landing locally, 36% of the control set leaves the tenant entirely. Let files land on laptops and that drops to 9%, because an enclave protects what is inside it and nothing else. See [04-enclave-pattern](04-enclave-pattern.md) for the full split, including the things that never transfer — your people, your training, your incident reporting, your signature.

## What this is not

Not an adopted standard, not an assessment, not legal advice, not affiliated with any government program.

And not a claim that measurement solves the whole problem. Twenty-three of the sixty-four controls here cannot be automated at all — they are judgment, physical, or human — and pretending otherwise would repeat the original mistake of substituting something tidy for the thing that actually matters.

The specific thresholds are honest guesses. Whether MFA enforcement should be 99% or 95% is not something anyone has demonstrated. What the design gets right is that a wrong number is visibly wrong once you measure against it, which a wrong paragraph in a security plan never is.

## Reference

The rest of the documentation is reference material for the parts above.

- [01-first-principles](01-first-principles.md) — the four questions, in order, and why the order matters
- [02-ontology](02-ontology.md) — how the information is structured so the questions can be answered by query
- [03-signals](03-signals.md) — the twenty-two measurements and what each one is watching for
- [04-enclave-pattern](04-enclave-pattern.md) — what a provider carries, what stays yours, and how to tell
- [05-projections](05-projections.md) — how reports are generated rather than maintained
- [06-invariants](06-invariants.md) — the ten rules the model enforces on itself, and what each one prevents
- [07-at-three-sizes](07-at-three-sizes.md) — the same rules applied to a 12-person shop, a 200-person manufacturer, and a subcontractor with data in three clouds
- [08-evidence-types](08-evidence-types.md) — the five kinds of evidence, what each proves, and where each stops proving anything
