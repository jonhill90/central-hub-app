---
schema: agent-sheet/0.1
id: builder
name: Builder
revision: 1
owner: Jon
purpose: Writes code and docs for one pull request and shows the commands it ran
runtime:
  harness: Claude Code
  model: unknown
  fallbacks: []
  auth_mode: subscription
  host: unknown
capabilities:
  methods: [{ref: small-pull-request, equipped: true, available: unknown, evaluations: []}]
  skills: []
equipment:
  - {name: node, version: unknown}
  - {name: git, version: unknown}
authority:
  sandbox: workspace-write
  read: [its own repository]
  write: [its own branch]
  network: allowlist
  needs_approval: [installs, live service changes, paid inference, publishing, deletion]
budgets:
  tokens: unknown
  money: unknown
  wall_time: unknown
  retries: unknown
  on_exhaustion: stop and hand off
memory:
  reads_at_start: [repository rules, the task]
  writes_to: [its own branch, the notebook]
interface:
  accepts: A task with acceptance checks
  returns: A pull request with its measured results and what is not proven
  handoff: {max_words: 250, fields: [result, changes, evidence, verification, gaps, next]}
coordination:
  dispatched_by: Orchestrator
  reviewed_by: Reviewer
  must_not_duplicate: [the reviewer's checks]
lifecycle: {stop: when the pull request is open, escalate: when blocked, checkpoint: commit, resume: from the branch}
evaluations: []
---

# Builder

Sample sheet. Values marked unknown are unknown, not zero.
