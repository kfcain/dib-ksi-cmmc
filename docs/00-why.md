# Why this exists

## The problem

A prime contractor sends a machine shop technical drawings. Those drawings are why an adversary cares about a 40-person business. This is a confidentiality problem: if someone reads the CUI, the damage is done whether or not any system goes down, and no recovery plan undoes it.

That framing tells you where to spend: on who can reach the information and whether the barriers around it are actually up. It also names the cheapest control. CUI you never accepted cannot leak, and needs nothing encrypted, reviewed, or monitored afterward. Scope reduction is the only control that removes risk instead of managing it.

The current proof of security is a System Security Plan: a document describing an intended design, written once, graded by a human reading prose. A document is true on the day it is written and silent afterward. This repository replaces the document with measurements of the running environment, each with an expiry date. It adds no requirements — NIST SP 800-171 stays the floor at every class — it changes what counts as proof.

## The four questions

1. **What CUI do you hold, and could you hold less?**
2. **Who can reach it?**
3. **Are the protections actually on right now?**
4. **If one turns off, how fast do you find out?**

Every serious loss in this sector traces to one of those. The 2026 Verizon DBIR put third-party involvement at 48% of breaches, driven mostly by authentication failures rather than exploitation; only 23% of those third parties had fully remediated missing or misconfigured MFA.

**Question one.** Every piece of CUI in the model carries a reason: which contract requires it, and when someone last confirmed that is still true. CUI held without a stated reason is flagged. Everything downstream — encryption, access review, monitoring, assessment scope — is work you only do because the information is still sitting there.

**Question two.** Access is data you can query: which person, what they can do, why they need it, when that was last reviewed, and how strong their authentication is. "Who can read the drawings" should have an answer you can produce in a minute. A separated employee with a live account becomes a finding, because the access record joins to the personnel record.

**Question three.** An indicator is a measurable property of the running environment, not a description of one. Two rules keep the measurements honest. *Publish the denominator*: every coverage reading states what was measured out of how many, computed against the asset inventory rather than the tool's own view. *Measure enforcement, not policy*: a rule that exists but exempts a group is measured at the exemption.

**Question four.** Every measurement has a shelf life. Past it, the claim it supported reports **stale** — not passing, not failing. Confidentiality fails quietly: an MFA exemption never revisited, a share opened for a vendor, an endpoint agent that stopped reporting. Freshness as part of the claim means drift surfaces on its own. The same rule covers inherited controls: when a provider's validation feed goes quiet, everything inherited from it ages out together.

## The one thing never computed

A person signs. Attestation, adjudicating a finding, confirming what counts as CUI, accepting risk — each resolves to a named human, and the signature binds to the exact state signed. An unsigned attestation is reported as unsigned, never assumed.

## Where this lands across the DIB

The rule set is the same for the whole DIB; what changes is who runs each indicator. For a small shop the practical answer is usually a rented enclave: concentrate the CUI in one defended environment and inherit the infrastructure controls its provider already runs. For a manufacturer whose laptops handle CUI, or a subcontractor with data in several clouds, more of the same set stays in-house. [04-enclave-pattern](04-enclave-pattern.md) computes the split for each shape.

## What this is not

Not an adopted standard, not an assessment, not legal advice, not affiliated with any government program.

Not a claim that measurement solves the whole problem: 23 of the 64 indicators cannot be automated — they are judgment, physical, or human. And the locally chosen thresholds are proposed defaults, published for adversarial comment. What measurement gets right is that a wrong number is visibly wrong once you measure against it, which a wrong paragraph in a security plan never is.

## Read next

- [01-ksi-reference](01-ksi-reference.md) — the 64 KSIs: statement, CUI-confidentiality impact, classes, levels, 800-171 mapping. Generated from the catalog.
- [02-ontology](02-ontology.md) — how the information is structured so the four questions can be answered by query.
- [03-signals](03-signals.md) — the conventions every measurement follows.
- [04-enclave-pattern](04-enclave-pattern.md) — what a provider carries, what stays yours, and how to tell, at three organization shapes.
- [05-invariants](05-invariants.md) — the ten rules the validator enforces.
- [06-evidence-types](06-evidence-types.md) — the five kinds of evidence and where each stops proving anything.
