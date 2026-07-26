# DIB-KSI

**Measurement-based proof of NIST SP 800-171 security, built around one outcome: the confidentiality of CUI, for any organization in the DIB.**

If you hold CUI for a defense program, an adversary reading it is the loss that matters — the damage is done whether or not your systems stay up. The security question is four lines:

1. **What CUI do you hold, and could you hold less?**
2. **Who can reach it?**
3. **Are the protections actually on right now?**
4. **If one turns off, how fast do you find out?**

This repository answers those four with measurements instead of paperwork. It adds no requirements: 800-171's 110 stay the floor at every assurance class. What changes is the proof — a reading of the running system with an expiry date, instead of a paragraph describing an intended design. [docs/00-why](docs/00-why.md) is the five-minute version.

> Independent and unofficial. Not affiliated with or endorsed by DoD, the CMMC Program Management Office, the Cyber AB, FedRAMP, GSA, or NIST. Not an adopted standard, not an assessment, not legal advice. See [DISCLAIMER.md](DISCLAIMER.md).

## The rule sets

Three, each a registry with a reference generated from it:

- **64 KSIs** ([`ontology/ksi-catalog.json`](ontology/ksi-catalog.json)) — what must be true. Each carries a statement, a line stating how it protects the confidentiality of CUI, class and level applicability, and its 800-171 mapping. The 13 uplift KSIs (availability, integrity, program maturity) say plainly that they sit beyond the confidentiality floor and are never required below Class D. Reference: [docs/01-ksi-reference](docs/01-ksi-reference.md), generated from the catalog and drift-checked in CI.
- **22 measurements** ([`ontology/signals.json`](ontology/signals.json)) — what a machine checks continuously: MFA enforcement, endpoint coverage, external sharing defaults, standing administrator count, patch latency, encryption on the stores holding CUI, dormant accounts, undeclared flows. Eleven cite an external authority for their requirement (CISA's cloud baselines, the known-exploited-vulnerability catalogue, CMVP, the incident-reporting clause); eleven are this project's own policy choices and say so per signal. Conventions: [docs/03-signals](docs/03-signals.md); the generated list is in [COMPONENTS.md](COMPONENTS.md).
- **10 invariants** ([`ontology/dib-ksi-ontology.json`](ontology/dib-ksi-ontology.json)) — what the software refuses to let you claim: it rejects self-graded status, aggregate coverage percentages, unverified inheritance, hand-typed deliverables, and unsigned attestations treated as signed. [docs/05-invariants](docs/05-invariants.md).

Two rules do most of the work. **Coverage is universal**: an uncovered subject is named (*one uncovered: WKS-SHOP-04*), never averaged into a percentage, and an exception must carry a justification and an expiry date. **Claims go stale**: every measurement has a shelf life, and past it the claim it supported reports stale, not passing, not failing. Confidentiality decays quietly — an MFA exemption, a share opened for a vendor, an agent that stopped reporting — and staleness is how that drift surfaces on its own.

## It applies across the whole DIB

Levels decide *what* is required (CMMC L1/L2/L3, unchanged). Classes decide *how much proof* (A cheapest, D deepest). Deployment profiles decide *who runs each indicator* — the same rule set serves a 12-person shop inside a rented enclave, a 200-person manufacturer whose laptops handle CUI, and a subcontractor with data across three clouds. For the enclave-only shape, the share of the catalog that leaves the tenant entirely:

| Class | In scope | Off the tenant |
|---|---|---|
| A | 43 | 13 (30%) |
| B | 60 | 21 (35%) |
| C | 60 | 21 (35%) |
| D | 64 | 23 (36%) |

The moment a file lands on a workstation, that workstation is in scope and those figures collapse to 7–10%. The full splits, the three-test inheritance rule, and what never transfers (screening, training, marking, reporting, log review, the signature) are in [docs/04-enclave-pattern](docs/04-enclave-pattern.md); the generated tables are in [COMPONENTS.md](COMPONENTS.md).

## The site

Three pages, generated from the registries, no network access once loaded: the [overview](https://kfcain.github.io/dib-ksi-cmmc/index.html), the [reference](https://kfcain.github.io/dib-ksi-cmmc/reference.html) with every indicator's evidence card, and the [self-assessment](https://kfcain.github.io/dib-ksi-cmmc/assess.html), which returns a named gap list rather than a readiness score — three unanswered indicators is a specific afternoon's work; "82% ready" is an argument.

Each page is one self-contained file. Download it from [`site/`](site/) and open it locally, or mirror it to a gist for a rendered snapshot (for example via [gistpreview](https://gistpreview.github.io)): it renders identically anywhere, because it loads nothing from the network.

## Try it

```bash
node tools/validate.mjs instances/ostrander-enclave.json      # check the model holds together
node tools/project.mjs  instances/ostrander-enclave.json all  # what the answers look like
./tools/ci.sh                                                 # everything, same as CI
```

Node's standard library, nothing to install — it has to run inside a disconnected network with no package manager. The worked example is a made-up 40-person manufacturer and it deliberately does not pass: 14 of 22 measured indicators clear, the attestation is unsigned, and the output names the uncovered shop workstation and the three people with lapsed training. An example that passes everything has not shown you it can fail.

## What is known and what is guessed

The problem statement is solid: the 2026 Verizon DBIR put third-party involvement at 48% of breaches, driven mostly by authentication failures, with only 23% of those third parties having fully fixed missing MFA. The model is internally checked: all 110 underlying requirements map to a KSI, every measurement points at a real indicator and a named collection method, and the tooling fails closed. The eleven locally chosen thresholds are honest guesses, flagged as such per signal. And nobody has shown that a green board here predicts fewer incidents — that is the claim worth testing, and it is untested.

## What's here

| Path | |
|---|---|
| [`docs/`](docs/) | [00-why](docs/00-why.md), the generated [KSI reference](docs/01-ksi-reference.md), and the model reference docs |
| [`ontology/`](ontology/) | The registries: KSIs, measurements, invariants, collection methods, responsibility patterns, exception policy |
| [`instances/`](instances/) | A worked example |
| [`tools/`](tools/) | Validator, projection engine, generators, tests, linters, CI |
| [`COMPONENTS.md`](COMPONENTS.md) | Generated index of everything above |
| [`site/`](site/) | The three pages, generated from the registries |
| [`AGENTS.md`](AGENTS.md) | Rules for AI agents working with this data |

## Push back on it

The useful contributions: a threshold you can show is wrong, an enclave assumption that doesn't match a real provider's contract, a way to make the tooling report something false, or a setup the model can't describe. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache-2.0 for code, CC BY 4.0 for the writing. See [LICENSE](LICENSE), [LICENSE-DOCS](LICENSE-DOCS), and [NOTICE](NOTICE).
