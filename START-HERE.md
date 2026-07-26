# Start here

**This does not add requirements. It changes how you prove the ones you already have.**

That sentence is the whole thing. NIST SP 800-171 asks for 110 requirements and doesn't change. What changes is what you hand over as proof: instead of a paragraph in a security plan describing how something is configured, you take a reading of how it is configured, and the reading has an expiry date.

## The idea in four lines

1. **What sensitive information do you hold, and could you hold less?**
2. **Who can reach it?**
3. **Are the protections on right now?**
4. **If one turns off, how fast do you find out?**

Everything else in this repository is bookkeeping so those four can be answered by query instead of by memory.

## The one rule worth remembering

**A claim is only good while the reading behind it is fresh.**

Check multi-factor authentication in March against a thirty-day window and the claim holds through April. In May, with no new reading, it reports **stale** on its own — not passing, not failing. Nobody has to notice, and nobody has to decide to admit the environment moved.

A document written in March still reads as true in December. That difference is the entire argument.

## Yes, the reference is large. No, you do not read it.

The catalogue covers every arrangement so the model can be correct about any of them. What one organisation actually holds is much smaller:

| If you are | You own alone | Across | Automatable | Human judgment |
|---|---|---|---|---|
| A 12-person shop working entirely inside a rented enclave | 15 | 9 families | 4 | 11 |
| A 200-person manufacturer whose laptops handle controlled files | 18 | 11 families | 5 | 13 |
| A subcontractor with data spread across three clouds | 23 | 10 families | 6 | 17 |

Two things fall out of that table.

**The work is small and mostly human.** For the smallest shape, four things are worth automating. The rest is training records, screening, marking decisions, incident reporting, and someone signing. Those were always your job and no framework removes them.

**Renting beats building.** The gap between the first row and the third is not about competence or budget. It is about where the information lives. Concentrating controlled data in one defended environment moves more than half the work off your plate; scattering it across three general-purpose clouds moves it all back.

## What to read, in order

Most people need the first two and stop.

- **[Why this exists](docs/00-why.md)** — the problem, in about five minutes.
- **[The same rules at three sizes](docs/07-at-three-sizes.md)** — find the row that looks like you.
- [The four questions](docs/01-first-principles.md) — why that order, and why scope reduction comes first.
- [The five kinds of evidence](docs/08-evidence-types.md) — what actually counts as proof, and what does not.
- [The ten rules the model enforces](docs/06-invariants.md) — what the software refuses to let you claim.
- [What gets measured](docs/03-signals.md), [how a reading is collected](ontology/collection.json), [what an enclave carries](docs/04-enclave-pattern.md) — reference, for when you need it.

## What this is not

Not an adopted standard. Not an assessment. Not legal advice. Not affiliated with or endorsed by any government program.

And not a claim that measurement solves the problem. A third of the catalogue cannot be automated at all, and nobody has yet shown that a green board here predicts fewer incidents. That is the claim worth testing, and it is untested.

## Answer it for yourself

[The self-assessment](https://kfcain.github.io/dib-ksi-cmmc/assess.html) asks one plain question per indicator that applies to your shape — *"Are people screened before they get access, and does their access actually end when they leave?"* rather than the control language. Answer in place, partly, not in place, or don't know.

It gives you a named gap list, not a readiness score. That is deliberate: an aggregate percentage hides which one is uncovered, and the uncovered one is the only part you can act on. Three unanswered indicators is a specific afternoon's work; "82% ready" is an argument.

**Don't know is a real answer**, and often the most useful one. Not knowing whether a protection is on is different from knowing it is off, and usually cheaper to resolve — somebody has to go look.

## Try it

```bash
node tools/project.mjs instances/ostrander-enclave.json all
```

The worked example is a made-up 40-person manufacturer, and it deliberately **does not pass**. It names the shop workstation missing endpoint coverage and the three people with lapsed training, rather than reporting a percentage. An example that passes everything has not shown you it can fail.
