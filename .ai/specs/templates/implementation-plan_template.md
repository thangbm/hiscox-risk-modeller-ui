# <TICKET-ID> — <EPIC/PHASE ID>: <Short title>

> Implementation spec for <epic/phase> **<EPIC-ID>** from [<breakdown doc title>](<relative/path/to/breakdown.md>).
> Covers tickets **<T1>** and **<T2>** only. Companion discovery: [analysis.md](<relative/path/to/analysis.md>).

<!--
HOW TO USE THIS TEMPLATE
- Copy to `.ai/specs/<ticket-slug>/implementation-plan.md` and replace every <placeholder>.
- Delete sections that genuinely do not apply; do not leave empty headings.
- Delete these HTML comments before committing.
- Keep it decision-dense: state what was chosen AND what was rejected, not just a task list.

HOW TO TRACK EXECUTION (this file is the single source of truth for progress)
- Sections above `## Steps` describe the *intent* and are edited only when the plan changes.
- `## Steps`, `## Execution Log`, `## Deviations` and `## Resume Point` are *live* and updated as
  work happens — this is what lets anyone (human or agent) resume without re-deriving context.
- After finishing each step: set its status + evidence, append one Execution Log entry, and rewrite
  `## Resume Point`. Do this in the same commit as the code.
- The Execution Log is **append-only**. Never delete or rewrite past entries — if something was
  wrong, add a new entry that supersedes it and record the change under `## Deviations`.
- Adding new work later? Append new numbered steps (do not renumber existing ones) and log why.
- Status values: `todo` · `in-progress` · `blocked` · `done` · `skipped` (skipped needs a reason).
-->

---

## Status

<Keep this block to ≤ 8 lines. It is the first thing a reader — or an agent resuming work — sees.>

| Field | Value |
|-------|-------|
| Overall | `not-started` \| `in-progress` \| `blocked` \| `complete` |
| Progress | <n> / <total> steps done |
| Last updated | <YYYY-MM-DD> by <name/agent> |
| Branch / PR | `<branch>` · <PR link or “none yet”> |
| Verification | <build/test/lint state at last update, e.g. “all green” / “3 failing”> |
| Blockers | <none, or the one thing preventing progress + who unblocks it> |

---

## Understanding

<2–5 sentences: the problem in domain terms and why it matters. Name the constraint that shapes the
design (e.g. "must stay SDK-free", "host owns the router", "no server round-trip while typing").
Then list what this spec delivers, one bullet per ticket.>

- **<T1>** — <the contract / types / module delivered, plus its supporting pieces>.
- **<T2>** — <the behaviour delivered, and the specific guards or edge cases it owns>.

<Optional: one line naming the existing pattern this mirrors, with the file that demonstrates it.>

## Scope

- **In scope:** <new/changed artefacts and where they live>; <matching tests and where they live>.
- **Out of scope (later tickets):** <explicitly name what a reader might assume is included —
  persistence, messaging, DI registration, concrete implementations, the submit/attach action, …>

## Assumptions

<Each assumption must be falsifiable — something a reviewer can confirm or reject. Cover at minimum:
where code lives (namespace/alias), dependencies (new packages, or explicitly none), ownership and
lifetime of resources/state, contracts with adjacent layers (UI ↔ API, host ↔ remote), and anything
you decided without being told.>

- <Location/namespace assumption, mirroring `<existing reference type/file>`.>
- <Dependency assumption — e.g. "no new packages; X ships in the shared framework / is already in `package.json`".>
- <Ownership/lifecycle assumption — who disposes, cleans up, or owns which state.>
- **<Cross-boundary contract>:** <what the other side does and does **not** guarantee; which values
  are display-only hints versus contract inputs; which decision is deferred to a later ticket.>

## Design

### <T1> <types / module / component> (`<folder path>`)

- **`<TypeOrComponentName>`** (<enum / record / interface / hook / component>) — <purpose>;
  <members and their meaning>; <constraints, e.g. "no SDK types", "no server data stored here">.
- **`<TypeOrComponentName>`** (<kind>) — <purpose and members>. <Document any non-obvious contract:
  equality, disposal, nullability, defaults.>
- **`<TypeOrComponentName>`** (<kind>) — <signature or props>. <Which existing shape it mirrors and
  which conventions it follows.>

### <T2> <decorator / behaviour / panel> (`<folder path>`)

- **`<TypeOrComponentName>`** (<kind>) implementing/using `<contract>`:
  - <Step 1 of the behaviour.>
  - <Selection / filter / matching rule — extract literals to named constants, no magic strings.>
  - **<Guard name>:** <what is rejected, and why it must be rejected>.
  - **<Failure case>** → <typed exception / error state / message>; **<other failure>** → <result>.
    <Cross-reference the decision under Risks if one exists.>
  - <Resource, length, or state handling — what it returns and what it owns.>

### Conventions

<List only the repo conventions that actually constrain this change, e.g.:>
<Backend: file-scoped namespaces, one type per file, `sealed` by default, primary ctors, nullable
enabled, XML docs on public members, `async`/`await` + `CancellationToken`, no magic strings.>
<Frontend: TS `strict`, named exports, feature slice exposed via `index.ts`, MUI `sx` (no custom
theme), React Query for server state / Zustand for client state, tests mirror `src/` under `tests/`.>

## Key Files

- `<path/to/new/file>` — new <type/component>.
- `<path/to/new/file>` — new <type/component>.
- `<path/to/changed/file>` — <what changes and why>.
- `<path/to/tests/folder>/*` — new <test framework> tests (mirror source folder).
- Reference shape: `<path/to/existing/file>` and siblings.

## Risks & Open Questions

<Two kinds of entry:>
<1. **(decided — <short label>)** for choices already made — state the decision, why it wins, what was
   rejected and why, and which later ticket picks up any deferred part.>
<2. A plain question for anything still open — what is unknown, who must answer it, what it blocks,
   and what changes if the answer differs from the assumption.>

- **<Topic> (decided — <label>):** <the decision>. <Why it wins.> <Rejected alternative and why.>
  <Deferred part → which ticket owns it.>
- **<Topic> (decided — <label>):** <the decision, including any non-obvious platform behaviour that
  forces it>. <Idempotency / ordering / edge-case notes.>
- **<Open question>** — <what is unknown>; <who confirms it>; <what changes if the answer differs>.

## Steps

<Ordered and independently verifiable. Prefer "write the failing test → make it pass". Finish with a
step that runs the build and the relevant test suite against the acceptance criteria.>

<Each step carries its own status and **evidence** — the concrete artefact proving it is done (test
name, commit SHA, command output). "done" without evidence is not done. Do not renumber steps when
new work is appended; keep ids stable so the Execution Log stays readable.>

| # | Step | Status | Evidence / notes |
|---|------|--------|------------------|
| 1 | Create `<Type/Component>` in `<path>` with <members/props> and <docs>. | todo | |
| 2 | Create `<Type/Component>` in `<path>` (<key members>). | todo | |
| 3 | Add <T1> contract/shape tests in `<test path>` (<what they assert>). | todo | |
| 4 | Create `<Type/Component>` in `<path>` (<selection, guard, length, disposal / states>). | todo | |
| 5 | Add <T2> tests in `<test path>` using <fixtures>: happy path, <failure case>, <edge case>, plus <resource/state> assertions. | todo | |
| 6 | Run the build and <suite name> to verify all <EPIC-ID> acceptance criteria pass. | todo | |

<Steps appended after work started — keep them below the original list with a note saying why:>

| # | Step (added <YYYY-MM-DD> — <reason>) | Status | Evidence / notes |
|---|---------------------------------------|--------|------------------|
| 7 | <new work discovered during implementation> | todo | |

## Execution Log

<Append-only. One entry per work session or per completed step — whichever is coarser. Keep entries
short; they exist so the next person can resume, not as a diary.>

### <YYYY-MM-DD> — <name/agent> — steps <n>–<m>

- **Done:** <what actually landed, with file paths>.
- **Verified by:** <command run + result, e.g. `npm test` → 42 passed; `dotnet build` → 0 warnings>.
- **Learned:** <anything that contradicted an assumption, or a gotcha worth remembering>.
- **Next:** <the immediate next action — mirrored into Resume Point>.

### <YYYY-MM-DD> — <name/agent> — blocked on <topic>

- **Attempted:** <what was tried>.
- **Blocked by:** <the blocker and who/what unblocks it>.
- **Workaround in place:** <none, or what was stubbed and where the TODO lives>.

## Deviations

<What was built differs from what was planned — record it here rather than silently editing the
Design section, so reviewers can see the delta. Update the Design/Assumptions text too, and note here
that you did.>

| Date | Planned | Actually done | Why | Sections updated |
|------|---------|---------------|-----|------------------|
| <YYYY-MM-DD> | <original decision> | <what shipped instead> | <trigger: new info, assumption proved false, review feedback> | <Design §x / Assumptions #n / none> |

<Assumptions that turned out to be wrong, and open questions that got answered, also belong here:>

- <Assumption #n — **falsified** on <date> by <evidence>. Impact: <what changed>.>
- <Open question “<q>” — **answered** on <date> by <who>: <answer>. Impact: <what changed>.>

## Resume Point

<Rewrite this section every time you stop. It must be enough to restart cold, without reading the
Execution Log. If it is empty or stale, the tracking has failed.>

- **Next action:** <the single next thing to do, specific enough to start immediately>.
- **Current state:** <what exists on the branch right now; what compiles; what is stubbed>.
- **Uncommitted / WIP:** <files left half-finished, or “none — branch is clean”>.
- **Before continuing, re-check:** <assumptions or open questions that may have moved on>.
- **Definition of done for this ticket:** <the acceptance criteria, restated in one or two lines>.
