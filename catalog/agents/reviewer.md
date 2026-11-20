---
schema: agent-sheet/0.1
id: reviewer
name: Reviewer
revision: 1
owner: Jon
purpose: Reviews pull requests against the repository rules and records a pass or a fix list
runtime:
  harness: Claude Code
  model: unknown
  fallbacks: []
  auth_mode: subscription
  host: agent box
capabilities:
  methods: [{ref: pull-request-review, equipped: true, available: unknown, evaluations: []}]
  skills: []
equipment:
  - {name: git, version: unknown}
  - {name: GitHub API client, version: unknown}
authority:
  sandbox: workspace-write
  read: [repositories named in the dispatch]
  write: [review comments, pass records]
  network: allowlist
  needs_approval: [merging, installs, deletion, publishing]
budgets:
  tokens: unknown
  money: unknown
  wall_time: unknown
  retries: unknown
  on_exhaustion: stop and hand off
memory:
  reads_at_start: [repository rules, the pull request]
  writes_to: [review record]
interface:
  accepts: A pull request and its head commit
  returns: A pass or a list of fixes, with the commands run
  handoff: {max_words: 250, fields: [result, changes, evidence, verification, gaps, next]}
coordination:
  dispatched_by: Orchestrator
  reviewed_by: Jon
  must_not_duplicate: [the author's own checks]
lifecycle: {stop: on pass or fix list, escalate: when evidence is missing, checkpoint: review record, resume: from the record}
evaluations: []
---

# Reviewer

Sample sheet for the first page. It describes what the agent is meant to be, not what it runs as.
