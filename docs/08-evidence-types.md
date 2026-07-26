# The five kinds of evidence

Five kinds of evidence, ordered by how hard they are to fake and how much work they are to produce. Assurance classes differ mainly in which of these they will accept: lower classes take an assertion backed by configuration, higher classes want telemetry and a demonstration. Most arguments about "is this good enough evidence" are really arguments about which of these five somebody produced.

## E1 — Machine telemetry

A reading taken directly from the running system, by querying its live state rather than describing it.

**What makes it strong.** It reflects what is true at the moment of the query, cannot be backdated, and can be re-taken by somebody else who will get the same answer.

**Where it stops proving anything.** It says nothing about what was true yesterday, and it inherits the blind spots of whatever produced it. A reading that covers only the assets the tool already knows about is measuring the tool.

### The same evidence type at three sizes

**12-person shop in an enclave.** The provider’s feed reports that multi-factor authentication is enforced for all six accounts that can reach the enclave, listing the six.

**200-person manufacturer.** A query against the endpoint platform returns agent status for 214 machines, checked against an asset inventory of 218 — and names the four that are missing.

**Subcontractor across three clouds.** Three separate queries, one per provider, returning encryption state per storage location. The reading is only as good as the list of locations, which is the part that is actually wrong here.

**The mistake people make.** Presenting a dashboard screenshot as telemetry. A screenshot is a picture of a reading, not the reading, and nobody can re-derive it.

## E2 — Provenanced artifact

A document or export that carries proof of where it came from and that it has not been altered since — a signature, a hash chain, a trusted timestamp. Best when it originates from somebody other than the party being assessed.

**What makes it strong.** It survives the passage of time and the departure of the person who produced it. A third-party-originated artifact is the hardest kind of evidence to quietly improve.

**Where it stops proving anything.** It is true as of its date and silent afterward. It also proves the artifact is intact, not that its contents were correct when written.

### The same evidence type at three sizes

**12-person shop in an enclave.** The provider’s signed attestation of the environment, with a certificate covering the specific offering the shop is using rather than the provider’s brand generally.

**200-person manufacturer.** A signed export of the quarterly access review, hashed and timestamped when the reviewer approved it, so a later edit is detectable.

**Subcontractor across three clouds.** Three annual audit reports from three providers. Each is a legitimate provenanced artifact and none of them says anything about this tenant’s data specifically — which is exactly why they support shared responsibility rather than inheritance.

**The mistake people make.** Treating a vendor’s compliance certificate as covering your usage. Certificates cover a defined service in a defined configuration, and the thing you bought may sit outside it.

## E3 — Bound intent

A short policy statement wired to the configuration that enforces it, so the rule and its enforcement point at each other.

**What makes it strong.** It closes the oldest gap in compliance, where the written policy and the running system drift apart for years without anyone noticing.

**Where it stops proving anything.** It proves the rule is wired up, not that the wiring covers everything. A policy bound to one system and silent about three others looks identical from the policy side.

### The same evidence type at three sizes

**12-person shop in an enclave.** A one-paragraph rule stating controlled drawings never leave the enclave, bound to the platform setting that blocks download, print, and removable media — so turning the setting off breaks the stated policy visibly.

**200-person manufacturer.** A change-control rule bound to the branch protection and required-review settings that enforce it, rather than a procedure document describing what reviewers are supposed to do.

**Subcontractor across three clouds.** The failure case. A data-handling policy exists and binds to nothing, because there is no single enforcement point that covers all three locations. The absence of a binding is the finding.

**The mistake people make.** Writing the policy and the configuration separately and asserting they agree. If nothing breaks when they diverge, they will diverge.

## E4 — Human observation

Somebody looked, asked, or walked the floor, and wrote down what they found — interviews, walkthroughs, physical inspections.

**What makes it strong.** It reaches everything no query can see: whether people understand the rule, whether the shortcut everyone takes matches the documented process, whether the locked room is actually locked.

**Where it stops proving anything.** It does not scale, it is a snapshot, and its quality depends entirely on who did the looking and what they wrote down.

### The same evidence type at three sizes

**12-person shop in an enclave.** A walkthrough confirming the two machines with enclave access sit in the locked office rather than on the shop floor, with the date, the observer, and what was seen.

**200-person manufacturer.** Interviews with four engineers about how they actually move CAD files between the enclave and their laptops. This surfaces the workaround that telemetry cannot see because the workaround is compliant-looking.

**Subcontractor across three clouds.** Asking the engineering team which systems hold controlled information. This is how the third cloud gets discovered, because nobody put it through review and so it appears in no inventory.

**The mistake people make.** Recording the conclusion without the observation. "Confirmed compliant" is not evidence; what the observer saw, on what date, is.

## E5 — Demonstration

The capability is exercised under realistic conditions and the results are measured. Not a description of what would happen — a record of what did.

**What makes it strong.** It is the only evidence that distinguishes a capability that exists from one that works. Restore procedures and incident reporting paths fail here constantly, and it is far better to find that out on a Tuesday.

**Where it stops proving anything.** Expensive, and easy to stage into meaninglessness. A restore test against a small file on a good day proves less than the effort suggests.

### The same evidence type at three sizes

**12-person shop in an enclave.** Walking the incident reporting path end to end without filing a real report: who is called, what the reporting portal needs, and whether anybody has the credentials to submit within the required window.

**200-person manufacturer.** A restore of a controlled-data volume to a stated recovery objective, timed, with the actual duration recorded — including the part where the restore succeeded but took eleven hours against a four-hour objective.

**Subcontractor across three clouds.** A tabletop asking a simple question: controlled data is exposed in one of the three locations, who is called and within what deadline. The exercise usually establishes that nobody is sure which contract clause applies.

**The mistake people make.** Running the demonstration and recording only that it passed. The measured result is the evidence, and a failed demonstration honestly recorded is worth more than a staged success.

## How the assurance classes differ

Higher assurance classes do not ask for more paperwork, they ask for evidence further down this list. A class that accepts bound intent alone is asking whether you set it up. A class that wants telemetry plus a demonstration is asking whether it still works and whether you have proved it recently.
