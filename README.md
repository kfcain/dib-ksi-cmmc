# DIB-KSI

**Keeping defense information out of the wrong hands is not complicated. Proving you're doing it has become absurd.**

If you make parts for a defense program, someone sent you drawings. Those drawings are worth stealing. That is the entire problem, and it is a confidentiality problem before it is anything else — an adversary reading your technical data does damage whether or not your systems stay up.

So the security question is small enough to hold in your head:

1. **What sensitive information do you actually have, and could you have less of it?**
2. **Who can reach it?**
3. **Are the protections actually turned on right now?**
4. **If one of them turns off, how fast do you find out?**

That's it. Every real breach in this sector is a failure of one of those four. Stolen credentials, an endpoint nobody was watching, an attacker sitting quietly for months.

The current way we prove security answers none of them. It asks for a System Security Plan — a document describing an intended design, written once, graded by a human reading prose. A 40-person machine shop now navigates scoping guides, asset categories, service provider tables, responsibility matrices, and 320 assessment objectives, most of it before anyone confirms the admin accounts have MFA.

**This repository answers the four questions with measurements instead of paperwork.**

**It does not add requirements.** NIST SP 800-171 asks for 110 things and that does not change. What changes is what you hand over as proof — a reading of the running system with an expiry date, instead of a paragraph describing an intended one. If you only read one page, read [START-HERE](START-HERE.md).

**Two pages you can click through:** the [explainer](https://kfcain.github.io/dib-ksi-cmmc/explainer.html) in plain language, and the [practitioner view](https://kfcain.github.io/dib-ksi-cmmc/practitioner.html) with all 64 indicators, the 22 measurements and their sources, the collectors that produce them, and the invariants the build enforces. Both run entirely in the browser and reach the network zero times once loaded.

> Independent and unofficial. Not affiliated with or endorsed by DoD, the CMMC Program Management Office, the Cyber AB, FedRAMP, GSA, or NIST. Not an adopted standard, not an assessment, not legal advice. See [DISCLAIMER.md](DISCLAIMER.md).

## How it answers them

**What do you have, and could you have less?** Every piece of controlled information in the model carries a reason it exists: which contract needs it, and when someone last checked that's still true. Data with no stated reason is flagged. This is the cheapest control there is, because information you never took requires nothing of you afterward: nothing to encrypt, nobody's access to review, and never a monitor to keep running.

**Who can reach it?** Access is recorded as a thing you can query — who, what they can do with it, why they need it, when that was last reviewed, and how strong their authentication is. Not reconstructed from a spreadsheet at audit time. "Who can read the drawings" should be a question with an answer.

**Are the protections on?** Twenty-two measurements of the running environment: multi-factor enforcement, endpoint coverage, external sharing defaults, standing administrator count, patch latency on internet-facing systems, encryption on the stores holding controlled data, dormant accounts, undeclared network flows.

Coverage requirements are universal rather than statistical. There is no "95% is good enough" bar, because no authority publishes one — CISA, CIS, the Defense Information Systems Agency and Microsoft all use per-item pass or fail plus documented exceptions. So an uncovered subject is named, not averaged away: the finding reads *one uncovered: WKS-SHOP-04*, which somebody can go fix, rather than *97.6% against a 99% bar*, which somebody will argue about. An exception is allowed, but it has to carry a justification and an expiry date.

Eleven of the twenty-two cite an external authority for their requirement. `MS.AAD.3.1v1` from CISA's Microsoft 365 baseline says phishing-resistant multi-factor authentication shall be enforced for all users; `MS.AAD.7.1v1` sets a floor of two and a ceiling of eight standing global administrators. The other eleven are this project's own judgment, and each says so in the registry rather than in a footnote.

**How fast would you know?** Every measurement has a shelf life. When the newest one ages past it, the claim it supported goes **stale** — not passing, not failing, stale — automatically and visibly. A document written in March still reads as true in December. A measurement does not.

That last rule is what the design turns on. **Confidentiality decays quietly.** An MFA exemption added for one contractor, a share opened for a vendor, an agent that stopped reporting — none of them announce themselves, and all of them show up here as something going stale or breaching a threshold.

## If you're a small shop, the practical advice is: don't build this yourself

Rent a defended enclave. Put the controlled information inside it, work on it through a thin client, and let the provider run the infrastructure controls they already run for everyone else.

The model computes what that buys you, and it depends on which assurance class you are working toward, because the classes bring different numbers of controls into scope:

| Class | In scope | Off your plate | Shared | Yours alone |
|---|---|---|---|---|
| A | 43 | 13 (**30%**) | 19 | 11 |
| B | 60 | 21 (**35%**) | 24 | 15 |
| C | 60 | 21 (**35%**) | 24 | 15 |
| D | 64 | 23 (**36%**) | 26 | 15 |

If files also land on your laptops, those numbers collapse to 7% at Class A and 9–10% everywhere else. The moment a drawing reaches a workstation, that workstation is in scope, and endpoint protection, disk encryption, patching, and removable media come straight back to you. The enclave protects what is inside it. Nothing else.

**The class ladder deepens proof, it does not hand you more solo work.** Look down the last column: work you own alone barely moves, 11 to 15 and then flat. The shared column is what grows, 19 to 26. Climbing from B to C brings no new controls into scope at all — the two classes are identical at 60 — and instead demands two independent automated methods where one used to do, a three-day measurement cadence instead of monthly, and six months of history instead of thirty days. You are not taking on more responsibility. You are proving the same responsibility harder.

Some things never transfer, whatever you buy: screening your people, training your people, deciding what gets marked, reporting your incidents, reviewing your logs, and signing the attestation. The provider does those for its own staff, not for yours.

## What we know, and what we're guessing

Worth being blunt, since this project's entire argument is about not trusting unverifiable claims.

**Reasonably solid:** the problem statement. The 2026 Verizon DBIR put third-party involvement at 48% of breaches, up from 30%, driven mostly by authentication failures — and only 23% of those third parties had fully fixed missing MFA. Credentials and unwatched endpoints are where the losses come from.

**Cited, not invented:** eleven of the twenty-two measurements now carry an external authority — CISA's cloud baselines, the known-exploited vulnerability catalogue, the cryptographic module validation program, and the incident-reporting clause. Where an authority exists, we cite it instead of picking a number.

**Internally checked:** the model is consistent. All 110 underlying requirements map to something, every measurement points at a real control and at a named collector, the tooling fails closed, and 58 tests confirm it. The enclave percentages above are arithmetic over our own analysis.

**Guessing, honestly:** the other eleven. Detection and containment time, remediation latency, restore-test intervals, training currency — no authority publishes figures for those, so they are our judgment and the registry says so per measurement. Nobody has yet shown that a green board here predicts fewer incidents. That is the claim worth testing, and it is untested.

**Throughput is not outcome.** FedRAMP's pilot of this approach produced 12 authorizations from 26 submissions in its first phase, and the program reports authorizing 114 services in six months. Those are speed numbers. No published study shows this style of assurance produced better security results.

The difference from a written plan is that a wrong number here is *visibly* wrong the moment you measure against it. A wrong paragraph in a security plan never is.

## The reference is large. The work is not.

The catalogue covers every arrangement so the model can be correct about any of them. No organisation holds all of it:

| If you are | You own alone | Across | Automatable | Human judgment |
|---|---|---|---|---|
| A 12-person shop entirely inside a rented enclave | 15 | 9 families | 4 | 11 |
| A 200-person manufacturer, laptops handle CUI | 18 | 11 families | 5 | 13 |
| A subcontractor with data in three clouds | 23 | 10 families | 6 | 17 |

Four things worth automating at the small end, and the rest is training, screening, marking, reporting, and a signature — work that was always yours and that no framework removes.

## Try it

```bash
node tools/validate.mjs instances/ostrander-enclave.json      # check the model holds together
node tools/project.mjs  instances/ostrander-enclave.json all  # what the answers look like
./tools/ci.sh                                                 # everything, same as CI
node tools/gen-pages.mjs                                      # re-bind the pages to the registries
```

Node's standard library, nothing to install — it has to run inside a disconnected network where there's no package manager.

The example is a made-up 40-person manufacturer, and it deliberately **doesn't** pass: 14 of 22 measurements clear, the attestation is unsigned, and the output says so. It names the uncovered shop workstation and the three people with lapsed training rather than reporting a percentage. An example that passes everything hasn't shown you it can fail.

## What's here

| Path | |
|---|---|
| [`docs/`](docs/) | Why this exists, starting with [00-why](docs/00-why.md). [The ten rules](docs/06-invariants.md) and [the same rules at three sizes](docs/07-at-three-sizes.md) are the two most useful entry points after that |
| [`ontology/`](ontology/) | What gets measured and on whose authority, how a reading may be collected, what an enclave carries, how exceptions work |
| [`instances/`](instances/) | A worked example |
| [`tools/`](tools/) | Validator, report generator, tests |
| [`COMPONENTS.md`](COMPONENTS.md) | Generated index of everything above |
| [`site/`](site/) | The overview, the self-assessment, and the reference tool, all generated from the registries |
| [`AGENTS.md`](AGENTS.md) | Rules for AI agents working with this data |

## Push back on it

The useful contributions are a threshold you can show is wrong, an enclave assumption that doesn't match a real provider's contract, a way to make the tooling report something false, or a setup the model can't describe. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache-2.0 for code, CC BY 4.0 for the writing. See [LICENSE](LICENSE), [LICENSE-DOCS](LICENSE-DOCS), and [NOTICE](NOTICE) for attribution and trademarks.
