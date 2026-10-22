Plan: /home/param/Work/breach/docs/twitch-clone-plan.md
PR ids in order: PR-01 PR-02 PR-03 PR-04 PR-05 PR-06 PR-07 PR-08 PR-09 PR-10 PR-11 PR-12
Verification rule: Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.
Execution playbook: pstack/skills/poteto-mode/playbooks/autopilot-stack.md
Who merges: operator reviews and lands the stack. No auto-merge.
Done condition: All 12 PRs appended to the base-branch stack with clean verdicts. Operator lands.
Run budget: max 8 hours wall-clock, max 8 ticks.
Lane model: inherit-parent (single opencode family).
Forge: gh. No gt. No origin pr.