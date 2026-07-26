# The four questions

Compliance programs usually start at the control list and work backward toward the environment. That is how a 40-person shop ends up reading a scoping guide before anyone has checked whether the admin accounts have MFA.

Start where the risk starts instead. Four questions, in this order, because each one narrows the next.

## 1. What sensitive information do you have, and could you have less?

Every piece of controlled information in this model carries a reason: which contract requires it, and when someone last confirmed that is still true. Information held without a stated reason gets flagged.

This is not an inventory exercise. It is the highest-leverage control available and the only one that removes risk rather than managing it. A drawing you never accepted cannot leak. A drawing you deleted when the contract closed cannot leak. Everything downstream — encryption, access review, monitoring, evidence retention, assessment scope — is work you only do because the information is still sitting there.

Most shops hold more than they need. Old programs, superseded revisions, an email thread from 2021 with an attachment. Scope reduction is usually the largest and cheapest security win available, and it is almost never where a compliance project starts.

## 2. Who can reach it?

Access is modeled as something you can query: which person, what they can do, why they need it, when that was last reviewed, and how strong their authentication is.

Not reconstructed from a document at audit time. "Who can read the drawings" should have an answer you can produce in a minute. If producing it takes a week, that is itself the finding.

This ranks second because authentication failure is the dominant path into these environments. Third-party involvement reached 48% of breaches in the 2026 DBIR, driven mostly by credential problems rather than exploitation, with only 23% of those third parties having fully fixed missing MFA. An access model that lives only on paper cannot answer that risk. One that lives as data can.

Two useful things fall out of modeling access properly. A separated employee with a live account becomes a finding rather than an anomaly nobody owns, because the access record joins to the personnel record. And an account with broad reach and weak authentication is visible as one problem, instead of two facts sitting in different systems.

## 3. Are the protections actually turned on?

An indicator is a measurable property of the running environment, not a description of one. MFA enforcement percentage. Endpoint coverage against the asset inventory. Patch latency on internet-facing systems. Encryption status on the stores holding controlled data. Dormant accounts. Network flows nobody declared.

Two rules keep these honest.

**Publish the denominator.** Every percentage states what was measured and out of how many. That catches "98% of the endpoints the agent already knows about" — a number that looks like coverage but actually measures the tool's own visibility. Coverage is computed against the inventory, never against the tool's view of the world.

**Measure enforcement, not policy.** A rule that exists but exempts a group is measured at the exemption. The question is not whether something was written down. It is how many accounts, endpoints, or data stores are covered right now.

## 4. If a protection turns off, how fast do you find out?

Every measurement has a shelf life. Past it, the claim it supported reports **stale** — not passing, not failing, stale.

This rule does the most work, because confidentiality does not fail loudly. It fails when someone adds an MFA exemption for a contractor and never revisits it, opens a share for a vendor during a deadline, or when an endpoint agent stops reporting and nobody notices for a quarter. None of those announce themselves, and none are visible in a document written before they happened.

Making freshness part of the claim means drift surfaces on its own. Nobody has to decide to admit the environment moved.

The same logic covers borrowed protections. If you inherit controls from a provider and their validation feed goes quiet, everything inherited from them ages out together and reports stale. That is correct. You stopped receiving evidence those protections are running, so you should stop claiming they are.

## Why this order

Each question constrains the next, which keeps scope from growing on its own.

What you hold determines what is in scope. What is in scope determines which people, processes, and systems matter. Those determine what is worth measuring. What you measure determines what you can honestly claim.

Run it the other direction, starting from a control list, and you spend the project justifying why 110 requirements apply to a shop whose entire exposure is one folder of drawings that two engineers need.

## The one thing that is never computed

A person signs.

Attestation, adjudicating a finding, confirming what counts as controlled information, accepting risk — those resolve to a named human, and the signature binds to the exact state signed. Everything else here is derived. That one is not, and an unsigned attestation is reported as unsigned rather than assumed.
