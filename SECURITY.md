# Security

## What this repository is

Registries, documentation, and dependency-free Node tooling that reads a JSON instance and computes projections. It holds no credentials, makes no network calls, and takes no input other than the files you point it at.

## Reporting a vulnerability

Open a private security advisory through the repository's advisory interface rather than a public issue. Include the instance or registry file that triggers the behavior where you can share one.

Two classes of report are especially welcome:

1. **An invariant that can be evaded** — an instance that passes `tools/validate.mjs` while violating an invariant in substance. That is the highest-severity defect this project has, because the framework's value is that its checks are not advisory.
2. **A derivation that can be influenced** — any way to make a claim compute as met, or a responsibility compute as inherited, that the underlying facts do not support.

## Handling instance data

The worked instance in `instances/` is synthetic. Never commit a real environment's graph to a public fork: an instance describes where controlled data lives, who can reach it, and which safeguards are currently failing. That is a targeting package.

Operators running this framework should treat their instance files as security protection data, hold them inside the same boundary as the environment they describe, and keep the finding queue at the same protection level as the evidence behind it.

## Reporting obligations are not replaced

Nothing in this repository substitutes for an operator's own incident reporting obligations under its contracts. The framework measures whether the reporting path has been exercised; it does not perform the reporting.
