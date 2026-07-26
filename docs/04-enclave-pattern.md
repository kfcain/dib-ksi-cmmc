# The defended-enclave pattern

## The recommendation, and why the framework makes it structural

The barrier that keeps small and non-traditional firms out of controlled work is not the assessment. It is standing up a compliant environment from zero. A defended enclave converts that from "build and run a compliant enterprise" into "subscribe, move the controlled data in, and configure your slice." A machine shop or a niche manufacturer that would otherwise decline the contract can clear the technical floor by renting it.

Routing most small and mid-size contractors into defended enclaves does five things at once, and each is measurable rather than rhetorical:

1. **Reduces access and sprawl at the contractor edge.** Controlled data concentrates into a few continuously validated environments instead of spreading across thousands of under-resourced ones. That is a better outcome for the data before it is a better outcome for the contractor.
2. **Cuts readiness and assessment cost.** The tenant implements and proves the delta it owns rather than the whole stack, and the assessor validates the shared pipeline once and samples it rather than re-walking the same inherited layer in every tenant.
3. **Shrinks scope.** Pulling processing into the enclave removes components from the boundary rather than documenting them into it.
4. **Standardizes protection, evidence, and documentation.** One hardened baseline replicated across tenants makes machine verification cheap, because sampling effectively identical resources is exactly the case sampling rules are written for.
5. **Enables clean inheritance.** A tenant claims controls the enclave already satisfies, without re-implementing or re-evidencing them.

The framework encodes this as data, not as advice. `ontology/responsibility-patterns.json` carries a responsibility mode for all sixty-four indicators under each profile, and the tooling derives a tenant's responsibility matrix from its declared architecture. Nothing is transcribed from a provider document.

## The two profiles, and the number that separates them

Sixty-four is the full catalogue, which is what applies at Class D. Fewer controls are in scope at the lower classes, so the split has to be read per class:

| Class | In scope | Inherited | N/A | Shared | Tenant-only | Off the tenant |
|---|---|---|---|---|---|---|
| A | 43 | 12 | 1 | 19 | 11 | **13 (30%)** |
| B | 60 | 20 | 1 | 24 | 15 | **21 (35%)** |
| C | 60 | 20 | 1 | 24 | 15 | **21 (35%)** |
| D | 64 | 22 | 1 | 26 | 15 | **23 (36%)** |

With managed endpoints processing controlled data locally, the same figures fall to 7% at Class A and 9 to 10% at the rest. Without any enclave at all — controlled information sitting in general-purpose cloud storage and SaaS — inheritance falls to 7% at Class C, but the interesting number there is the shared column at 33.

That last case deserves stating plainly, because it is easy to misread as a claim that commercial providers do nothing. A major provider genuinely runs the datacenter, the hypervisor, and the physical destruction of failed drives, and no customer can or should re-perform any of it. What a general-purpose commercial arrangement does not do is emit a machine-readable validation about *your* data on *your* cadence. An annual audit report is a point-in-time artifact about the provider, not a continuous reading about you, so the three-test rule lands most of that genuine provider work as shared rather than inherited. The difference between the second and third profiles is almost entirely about whether evidence flows, not about who operates what. That gap is the whole case for thin-client enclaves: an enclave carries a control only for the data actually inside it, so endpoint integrity, storage encryption, patching, media control, and perimeter defence all walk back to the tenant the instant a file lands on a workstation.

**A property of the ladder worth naming.** Work the tenant owns alone is nearly flat across the classes — 11, then 15, 15, 15. Shared work is what climbs — 19, 24, 24, 26. And Class B and Class C are identical in scope at 60 controls with an identical split; what separates them is proof depth, two independent automated methods rather than one, a three-day cadence rather than monthly, six months of history rather than thirty days.

Moving up a class therefore does not hand a small contractor more work to do by itself. It asks the contractor and its provider to prove the same shared work harder. That is the intended behaviour of separating levels from classes, and it is the strongest practical argument for a small shop targeting a higher class on an enclave rather than a lower one on its own infrastructure.

Of the twenty-three indicators that cannot be automated, the enclave-only profile carries eight and retires one as not applicable, leaving eleven squarely with the tenant and three shared. Automatability and inheritability are different axes, and the split is published so neither gets confused for the other.

## The three-test rule

Inheritance is a status a tenant earns at every ingest, never one it declares once. An objective may be marked inherited only when all three tests pass:

| Test | Question | Fails to |
|---|---|---|
| **T1 — Coverage** | Does the provider's authorization and responsibility matrix cover this objective at or above the tenant's assurance class, and is that authorization currently active? | tenant |
| **T2 — Feed** | Is the provider emitting a signed, machine-readable validation for it inside the tenant's class cadence? | shared |
| **T3 — No override** | Has the tenant left it alone, with nothing exported, no endpoint processing it locally, and no configuration that re-scopes it back? | tenant |

T3 is the test tenants fail most, and it fails for the most ordinary reason: someone downloaded a file. A tenant that pulls controlled data out of the enclave has re-scoped the destination back in, and the assignment degrades automatically rather than standing on a claim that is no longer true.

The tooling demonstrates each failure mode. An expired provider authorization fails T1. A provider feed that stops arriving fails T2 and degrades every inherited assignment to shared in one pass. A single component processing controlled data outside the enclave fails T3 and degrades inheritance to tenant. None of these require a human to notice.

## What never inherits

The enclave carries the controls it operates. It does not carry the ones that are inherently the contractor's, and the pattern registry states each residual in plain terms:

- **Personnel screening** — your people, not the provider's.
- **Training** — the provider trains its own staff; role-based training follows the person.
- **Marking judgment** — the enclave supplies labeling tooling, never the decision.
- **Incident reporting** — the contractual reporting obligation is the contractor's and cannot be subcontracted away.
- **Governance** — change review, executive support, security investment, secure development, vulnerability disclosure.
- **Log review** — an act of attention no provider performs on the tenant's behalf.
- **Scope declaration** — asset categorization and the dataflow model are the tenant's determination and the assessor's first thread to pull.
- **The affirmation** — the one entity the framework will not compute.

## How the evidence actually flows

Inheritance is only real when the proof travels with the control.

1. The provider runs collectors for the controls it operates and computes its own per-objective claim states, exactly as a tenant does.
2. It publishes a **signed, machine-readable validation feed** keyed by objective, carrying status, the class it sustains, the measurement timestamp, and a hash — never the underlying evidence.
3. The tenant ingests the feed, verifies the signature, and records provenance in its own manifest. Raw provider evidence stays with the provider; the tenant holds the attested claim and a pointer.
4. The tenant's validator re-runs the three-test rule on every inherited objective at ingest, and the feed-freshness indicator ages the whole inherited set together if the feed stops.
5. The responsibility matrix, security decision record, and posture rollup are projections that already contain the inherited layer. Nothing is transcribed, and a stale feed shows up as staleness rather than as silence.

The consequence for assessment is the part that changes population-scale cost: the assessor validates the provider's pipeline once and samples it, instead of re-examining the same inherited stack in every tenant that rents it.

## The honest boundary

Inheritance shrinks the tenant's obligation. It never zeroes it, and this framework is written so the residual is impossible to lose.

- **An unvalidated enclave inherits nothing but risk.** The provider must itself be assessed at or above the tenant's class, and T1 enforces that mechanically.
- **The grading invariant does not relax.** Every mapped objective must still be demonstrated — by the provider rather than by nobody.
- **Concentration is a real trade.** Enclaves reduce sprawl across thousands of under-resourced environments while raising the consequence of one provider's failure. The framework's answer is that provider validation is continuous, machine-checked, and visible to every tenant at once. It is not that the trade does not exist.
- **A shared responsibility matrix is a claim about two parties.** Publishing it as data rather than as a PDF is what lets a tenant, a provider, and an assessor disagree about a specific cell instead of about the document.
