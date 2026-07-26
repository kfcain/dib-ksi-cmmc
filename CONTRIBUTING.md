# Contributing

This is a working draft published for adversarial comment, and the contributions that improve it most are the ones that show something in it is wrong.

## What is most useful

1. **A threshold you can show is wrong.** Too loose to matter, too tight to achieve, or measured over the wrong population. Bring the reasoning and, where you have it, the data.
2. **A responsibility assignment that is misplaced.** If a defended enclave cannot actually carry an indicator this framework marks inherited — or carries one it marks tenant — that is a correction to `ontology/responsibility-patterns.json` with a stated basis.
3. **An invariant that can be evaded.** If you can construct an instance that passes validation while violating an invariant in spirit, open an issue with the instance. That is a bug, and the fix is usually a new test.
4. **A deployment pattern the ontology cannot express.** Operational technology, classified adjacency, a joint venture, a prime-sub arrangement the entities do not model cleanly.
5. **A projection that is missing.** If a consumer needs a deliverable and the graph cannot produce it, either the query is missing or the ontology is.

## What is less useful

Corrections that add taxonomy without adding measurement. A change that makes the model more expressive but nothing more measurable is moving in the wrong direction.

## Ground rules for the content

- **No normative standard text.** Reference requirement and objective identifiers, point at the published source. Do not paste in the text.
- **Every percentage publishes its denominator.** The validator enforces this on measurements; the same discipline applies to any claim made in the docs.
- **Thresholds are proposed defaults.** Where an authority has published an organization-defined parameter, that value governs and is marked as such.
- **State uncertainty in the artifact.** The exception-eligibility policy file carries a status line saying it needs confirmation against the current rule. That is the pattern: when something needs verification, the file says so where a reader will see it.
- **No vendor, product, or organization names** in the framework content. Patterns are described by their properties.

## How to propose a change

1. Open an issue describing the problem before writing code, unless the change is small and obvious.
2. Changes to `ontology/` must come with tests. Every invariant has a negative case that fails without it, and new rules follow that pattern.
3. Run the full suite before opening a pull request:

```bash
./tools/ci.sh
```

That is the same script continuous integration runs, so a green local run and a green CI run mean
the same thing. After editing any registry, regenerate the canonical dataset, the component index,
and the KSI reference with `node tools/gen-consolidated.mjs && node tools/gen-summary.mjs && node tools/gen-ksi-doc.mjs`;
the suite fails if any is stale, and it also fails if regenerating changes a file you have already committed.

4. Keep the repository dependency-free. Node's standard library only. This has to run inside a disconnected enclave, where no package manager exists.

## Versioning

The ontology, the signal registry, and the pattern registry each carry a version. Semantic intent:

- **Patch** — clarification, documentation, a corrected reference.
- **Minor** — a new entity, relation, indicator, or profile that does not change how existing data is interpreted.
- **Major** — a change to an invariant, an enum value, or the meaning of an existing field. Anything that could make a previously valid instance invalid, or a previously computed claim compute differently.

A version bump to any registry is a change with a changelog entry, never a silent shift in behavior. Instances declare nothing about versions today; when they do, the validator will refuse a mismatch rather than guess.

## Scope of the project

This framework organizes obligations and measures whether safeguards are running. It is not legal advice, not an adopted standard, and not a substitute for reading the rule that binds you. Contributions that blur that line will be asked to sharpen it.
