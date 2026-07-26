# Reports are generated, not maintained

Reference for how the answers get out of the model and in front of a person.

Nothing here stores a report. Everything a reader expects to find written down is computed when asked for, from the same facts the four questions are answered with. The test suite asserts the worked example stores no report of any kind.

```bash
node tools/project.mjs instances/ostrander-enclave.json all
```

| Projection | What it answers |
|---|---|
| `sdr` | The security decision record: components in scope, per-family claim status, affirmation state |
| `crm` | The responsibility matrix, derived from the declared architecture |
| `inherit` | Inheritance validity — the three-test result and any degraded assignments |
| `signals` | Measured posture against the class thresholds, with denominators and ages |
| `posture` | Computed class and level, and the explicit delta to the next class |
| `poam` | The finding queue with requirement-level exception eligibility |
| `access` | Who has access to which controlled data, on what basis, reviewed when |

A legacy system security plan is the same graph rendered into the older narrative shape. If a consumer needs one in ten years, it is a projection someone writes then — not a document maintained in parallel for a decade on the chance that it is asked for.

## What the worked instance produces

The synthetic forty-person manufacturer, running enclave-only and targeting the assessed class:

- **Responsibility:** 22 inherited, 1 not applicable, 26 shared, 15 tenant-only. Twenty-three of sixty-four fully off the tenant.
- **Inheritance:** all three tests pass; feed age well inside the window; zero degraded assignments.
- **Signals:** eleven of eighteen measured indicators pass. Endpoint coverage, remediation latency inside and out, detection and containment time, dormant accounts, and training currency all miss.
- **Posture:** the assessed level at the lower class today. The delta to the higher class is nine failing or stale indicators and twenty-three indicators needing a second independent method.
- **Findings:** thirty, each with computed requirement-level eligibility.
- **Affirmation:** unsigned, and reported as unsigned.

That last line matters more than it looks. The instance was built to be realistic rather than green, because a framework whose worked example passes everything has not demonstrated that it can fail.

## The property worth testing

Run the projections twice and the output is identical. Change one measurement and the affected claim, finding, posture line, and matrix cell all move together, because they were never separate artifacts. Delete the provider feed's freshness and the entire inherited layer ages at once.

This is what "deterministic system of record" has to mean in practice. Not that the system stores the answer, but that the system can always recompute it, and that no stored copy can quietly disagree with the environment.

## Where this points

Once deliverables are queries, ephemeral tooling becomes safe. An analyst asking for an unusual cut of the data is asking for a new query, not commissioning a new document that will drift from the last one. An assessor sampling a control is running the same projection the tenant ran, against the same graph, with their own credentials.

The deterministic layer is what makes everything built on top of it trustworthy. Generate freely — but generate from the system of record, and let the record stay the thing that is true.
