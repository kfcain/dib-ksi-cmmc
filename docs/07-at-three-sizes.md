# The same rules at three sizes

The same rules land very differently depending on what you have and how you have arranged it. These three are computed from the registries, not estimated — change an assignment and these numbers move.

> Illustrative shapes, not advice about your situation. Your class is set by your contract, and your scope is set by where your controlled information actually lives, which is often not where people think it lives.

**Reading the numbers.** The gap between the second and third rows is worth sitting with. Both are Class C, and they differ mainly in whether there is an arrangement scoped to controlled information with evidence that flows on a cadence. That single difference moves work between columns without changing what any provider is physically doing.

## 12-person machine shop, everything inside a rented enclave

**Assurance class B.** One prime, one program. Drawings arrive by secure transfer and are opened only inside a rented environment through a thin client. Nothing lands on the shop floor machines. Two people have admin rights, one of them the owner.

| | |
|---|---|
| Indicators in scope | 60 |
| Inherited outright | **21 (35%)** |
| Shared with a provider | 24 |
| Yours alone | 15 |

**What you actually run.** Effectively nothing of your own. The provider supplies the readings for what it operates. You need a way to record training completions, a way to show you exercised the incident reporting path, and someone to sign.

**The finding that shows up first.** Almost always the same one: a former employee or an outside accountant still has an account nobody disabled. It is the cheapest finding to fix and the most common way these environments are actually breached.

**The genuinely hard part.** Believing the enclave is enough and resisting the urge to "just email that one file" to somebody. One download reverses the entire scope reduction.

## 200-person manufacturer, enclave plus managed laptops

**Assurance class C.** Multiple programs, an engineering team that needs controlled files locally for CAD work, and a corporate network alongside the enclave. Laptops are managed but they do process controlled data.

| | |
|---|---|
| Indicators in scope | 60 |
| Inherited outright | **6 (10%)** |
| Shared with a provider | 36 |
| Yours alone | 18 |

**What you actually run.** Real infrastructure. Identity, endpoint protection, vulnerability management, log retention, and a way to prove two of those read from genuinely different places, because Class C requires a second independent reading.

**The finding that shows up first.** Endpoint coverage measured against the wrong denominator. The endpoint console reports every machine healthy, and it is right — about the machines it knows about. The four that never got enrolled are invisible to it by construction.

**The genuinely hard part.** The jump from one reading to two independent ones. Buying a second tool that queries the same system does not satisfy it, and that surprises people who have already spent the money.

## Subcontractor with controlled data spread across three clouds

**Assurance class C.** Grew by acquisition. Controlled information lives in a general-purpose cloud file share, an object storage bucket, and an engineering SaaS tool nobody put through review. No enclave, and no arrangement anywhere that is scoped to controlled defense information specifically.

| | |
|---|---|
| Indicators in scope | 60 |
| Inherited outright | **4 (7%)** |
| Shared with a provider | 33 |
| Yours alone | 23 |

**What you actually run.** More than the other two, but the surprise is what the providers already do for you and why you still cannot claim it. Roughly half the catalogue lands as shared: the provider supplies the capability and you configure it. Identity, encryption at rest, audit logging, and durability all work this way. You run the configuration and the reading; they run the machinery underneath.

**The finding that shows up first.** The framework refuses to model the environment cleanly, and that refusal is the finding. Controlled information sitting in a third location with no stated reason fails the minimisation rule before a single security control is assessed.

**On what is inherited.** Four indicators are genuinely inherited: datacenter physical access, environmental protection, and the physical media lifecycle inside the provider estate. Thirty-three are shared. That shared column is the honest picture of commercial cloud — the provider is doing real work, and you still own the configuration, the evidence, and the answer.

**The genuinely hard part.** Understanding why so little is inherited when the provider does so much. It is not that they are doing nothing — they run the datacenter, the hypervisor, and the physical destruction of failed drives, and no customer can re-perform any of that. It is that a commercial arrangement does not emit a machine-readable validation about your data on your cadence. An annual audit report is a point-in-time artifact about the provider, not a continuous reading about you, so the three-test rule lands it as shared rather than inherited.

## Reading these

Every figure above is computed from [`ontology/ksi-catalog.json`](../ontology/ksi-catalog.json) and [`ontology/responsibility-patterns.json`](../ontology/responsibility-patterns.json) when this page is generated. Change an assignment in either and these tables move on the next build.
