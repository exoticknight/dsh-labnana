# RED Agent Instructions

This project uses RED Protocol 1 to separate unresolved research, ongoing change, and accepted project knowledge.

## Repository mapping

- Document: `README.md` and `docs/**` contain accepted user, compatibility, and maintainer guidance.
- Research: new unresolved evidence and questions are tracked as Markdown artifacts under `research/`.
- Evolve: proposed or active changes are tracked as Markdown artifacts under `evolve/`.
- Research and Evolve artifacts are local-only working records and must not be committed. Create the directories locally when needed; their contents are ignored by Git.
- `RESEARCH_LISTINGS.md` predates RED adoption and remains at the repository root as a local historical research record; it is ignored by Git. Do not treat it as accepted guidance or migrate it without a separate decision.

## Knowledge states

### Research

Research contains unresolved questions, evidence, hypotheses, experiments, and conflicting claims. Do not treat it as accepted requirements.

### Evolve

Evolve contains proposed or active changes, their rationale, affected areas, acceptance conditions, and open questions. Preserve unresolved alternatives until the user or project policy decides them.

### Document

Document contains accepted project goals, terminology, interfaces, architecture rules, operating instructions, and contribution rules. Treat it as the normative baseline.

Code, tests, configuration, and runtime output provide implementation evidence. Report conflicts with Document and investigate them through Research. A resulting decision may repair the implementation or create an Evolve item that changes Document.

## Workflow

1. Read repository instructions and `red.toml` before starting work.
2. Load only the Document, active Evolve, Research, and implementation evidence relevant to the task.
3. Implement directly when accepted knowledge specifies the work.
4. Use Research when an unknown can change the decision. Report findings and wait for explicit authority before entering Evolve.
5. Use Evolve when the task changes accepted behavior, data, public interfaces, architecture, or engineering rules. A clear change may enter Evolve directly.
6. Design, implement, test, and revise inside the authorized Evolve scope.
7. When acceptance conditions pass, report evidence and proposed Document changes. Update Document only after separate acceptance.
8. Persist R or E when work crosses tasks, needs review, presents alternatives, or leaves an unresolved conflict.
9. Run `red check --json` when the CLI is available; otherwise perform the same structural checks by hand and report the skipped CLI check.

RED does not require a Research item for every change, and it does not authorize a transition by itself. Follow the repository's version-control policy for all artifacts.
