# The defended-enclave pattern

## Why the framework makes it structural

The barrier that keeps small firms out of controlled work is not the assessment; it is standing up a compliant environment from zero. A defended enclave converts that into "subscribe, move the CUI in, and configure your slice." The pattern is worth encoding because it is measurably better for the data:

- **CUI concentrates** into a few continuously validated environments instead of spreading across thousands of under-resourced ones.
- **Scope shrinks.** Pulling processing into the enclave removes components from the boundary rather than documenting them into it.
- **The tenant proves only the delta it owns**, and the assessor validates the shared pipeline once and samples it, instead of re-walking the same inherited layer in every tenant.
- **Inheritance is clean.** A tenant claims controls the enclave already satisfies, without re-implementing or re-evidencing them.

The framework encodes this as data, not advice: [`ontology/responsibility-patterns.json`](../ontology/responsibility-patterns.json) carries a responsibility mode for all 64 indicators under each deployment profile, and the tooling derives a tenant's responsibility matrix from its declared architecture. Nothing is transcribed from a provider document.

## The split, per class

64 is the full catalogue, which applies only at Class D. Fewer indicators are in scope at the lower classes, so the split reads per class. Enclave-only, nothing landing locally:

| Class | In scope | Inherited | N/A | Shared | Tenant-only | Off the tenant |
|---|---|---|---|---|---|---|
| A | 43 | 12 | 1 | 19 | 11 | **13 (30%)** |
| B | 60 | 20 | 1 | 24 | 15 | **21 (35%)** |
| C | 60 | 20 | 1 | 24 | 15 | **21 (35%)** |
| D | 64 | 22 | 1 | 26 | 15 | **23 (36%)** |

With managed endpoints processing CUI locally, the same figures fall to 7% at Class A and 9 to 10% at the rest. Without any enclave — CUI in general-purpose cloud storage and SaaS — inheritance falls to 7% at Class C, with 33 indicators landing as shared.

That last case is not a claim that commercial providers do nothing. A major provider genuinely runs the datacenter, the hypervisor, and the physical destruction of failed drives, and no customer can re-perform any of it. What a general-purpose arrangement does not do is emit a machine-readable validation about *your* data on *your* cadence; an annual audit report is a point-in-time artifact about the provider, not a continuous reading about you. So the three-test rule lands most genuine provider work as shared rather than inherited. And an enclave carries a control only for the data actually inside it: endpoint integrity, storage encryption, patching, media control, and perimeter defence all walk back to the tenant the instant a file lands on a workstation.

**The class ladder deepens proof, it does not add solo work.** Tenant-only work is nearly flat across the classes (11, then 15, 15, 15) while shared work climbs (19, 24, 24, 26). Class B and Class C are identical in scope at 60 indicators; what separates them is proof depth — two independent automated methods rather than one, a three-day cadence rather than monthly, six months of history rather than thirty days.

Of the 23 indicators that cannot be automated, the enclave-only profile inherits eight and retires one as not applicable, leaving eleven with the tenant and three shared. Automatability and inheritability are different axes.

## The three-test rule

Inheritance is a status a tenant earns at every ingest, never one it declares once. An objective may be marked inherited only when all three tests pass:

| Test | Question | Fails to |
|---|---|---|
| **T1 — Coverage** | Does the provider's authorization and responsibility matrix cover this objective at or above the tenant's assurance class, and is that authorization currently active? | tenant |
| **T2 — Feed** | Is the provider emitting a signed, machine-readable validation for it inside the tenant's class cadence? | shared |
| **T3 — No override** | Has the tenant left it alone, with nothing exported, no endpoint processing it locally, and no configuration that re-scopes it back? | tenant |

T3 is the test tenants fail most, usually because someone downloaded a file. The tooling demonstrates each failure mode: an expired provider authorization fails T1; a feed that stops arriving fails T2 and degrades every inherited assignment to shared in one pass; a single component processing CUI outside the enclave fails T3 and degrades inheritance to tenant. None of these require a human to notice.

## What never inherits

The enclave carries the controls it operates, not the ones that are inherently the contractor's:

- **Personnel screening** — your people, not the provider's.
- **Training** — the provider trains its own staff; role-based training follows the person.
- **Marking judgment** — the enclave supplies labeling tooling, never the decision.
- **Incident reporting** — the contractual obligation cannot be subcontracted away.
- **Governance** — change review, executive support, security investment, secure development, vulnerability disclosure.
- **Log review** — an act of attention no provider performs on the tenant's behalf.
- **Scope declaration** — asset categorization and the dataflow model are the tenant's determination.
- **The affirmation** — the one entity the framework will not compute.

## How the evidence flows

1. The provider runs collectors for the controls it operates and computes its own per-objective claim states, exactly as a tenant does.
2. It publishes a **signed, machine-readable validation feed** keyed by objective, carrying status, the class it sustains, the measurement timestamp, and a hash — never the underlying evidence.
3. The tenant ingests the feed, verifies the signature, and records provenance in its own manifest. Raw provider evidence stays with the provider.
4. The tenant's validator re-runs the three-test rule on every inherited objective at ingest, and the feed-freshness indicator ages the whole inherited set together if the feed stops.
5. The responsibility matrix, security decision record, and posture rollup are projections that already contain the inherited layer. A stale feed shows up as staleness rather than as silence.

## The same rules at three shapes

Illustrative shapes, not advice: your class is set by your contract, and your scope by where the CUI actually lives. Every figure is computed from [`ontology/ksi-catalog.json`](../ontology/ksi-catalog.json) and [`ontology/responsibility-patterns.json`](../ontology/responsibility-patterns.json); the generated per-profile tables are in [COMPONENTS.md](../COMPONENTS.md).

**12-person machine shop, everything inside a rented enclave (Class B).** In scope 60 · inherited 20 · N/A 1 · shared 24 · yours alone 15. You run almost nothing of your own: training records, an exercised incident reporting path, and a signature. The first finding is usually a former employee or outside accountant whose account nobody disabled — the cheapest finding to fix and the most common actual breach path. The failure mode that undoes the arrangement is "just email that one file": one download reverses the scope reduction.

**200-person manufacturer, enclave plus managed laptops handling CUI (Class C).** In scope 60 · inherited 6 · shared 36 · yours alone 18. You run real infrastructure: identity, endpoint protection, vulnerability management, log retention, and two of those must read from genuinely different places, because Class C requires a second independent method. The first finding is usually endpoint coverage measured against the wrong denominator: the console reports every machine it knows about as healthy, and the four never enrolled are invisible to it by construction.

**Subcontractor with CUI spread across three clouds, no enclave (Class C).** In scope 60 · inherited 4 · shared 33 · yours alone 23. The four inherited indicators are physical: provider facility access, escorts and visitors, and the physical media lifecycle — protection and sanitization — inside the provider estate. Everything else the providers genuinely operate lands as shared, because no arrangement is scoped to CUI with evidence that flows on a cadence. The first finding is often the model refusing to accept the environment at all: CUI sitting in a third location with no stated reason fails the minimization rule before any control is assessed.

## The honest boundary

- **An unvalidated enclave inherits nothing.** The provider must itself be assessed at or above the tenant's class; T1 enforces that mechanically.
- **The grading invariant does not relax.** Every mapped objective must still be demonstrated — by the provider rather than by nobody.
- **Concentration is a real trade.** Fewer environments to defend, higher consequence when one provider fails. The framework's answer is continuous, machine-checked provider validation visible to every tenant at once; it is not that the trade does not exist.
- **A shared responsibility matrix is a claim about two parties.** Publishing it as data lets a tenant, a provider, and an assessor disagree about a specific cell instead of about a document.
