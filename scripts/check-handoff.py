#!/usr/bin/env python3
"""Verify original-source project files preserved in this Codex handoff (not app tests)."""
import json, hashlib, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
records=json.loads((root/'reference/source-project-sha256.json').read_text())
redirects={
 'AGENTS.md':'reference/original-agent/AGENTS.md',
 'README.md':'reference/source-overrides/README.md',
 'agent/TASK-BRIEF.md':'reference/original-agent/agent/TASK-BRIEF.md',
 'agent/CONSTRAINTS.md':'reference/original-agent/agent/CONSTRAINTS.md',
 'agent/HANDOFF.md':'reference/original-agent/agent/HANDOFF.md',
 'agent/ACCEPTANCE-CHECKLIST.md':'reference/original-agent/agent/ACCEPTANCE-CHECKLIST.md',
 'docs/toolchain.lock.md':'reference/source-overrides/docs/toolchain.lock.md',
 'docs/runbooks/local-development.md':'reference/source-overrides/docs/runbooks/local-development.md',
 'docs/runbooks/live-demo.md':'reference/source-overrides/docs/runbooks/live-demo.md',
 'docs/runbooks/release.md':'reference/source-overrides/docs/runbooks/release.md',
 'docs/runbooks/rollback.md':'reference/source-overrides/docs/runbooks/rollback.md',
 'docs/architecture/system-context.md':'reference/source-overrides/docs/architecture/system-context.md',
 'docs/architecture/module-boundaries.md':'reference/source-overrides/docs/architecture/module-boundaries.md',
}
errors=[]
for rec in records:
    rel=rec['relative_source_path']
    path=root/redirects.get(rel,rel)
    if not path.is_file(): errors.append('MISSING '+str(path.relative_to(root)));continue
    if hashlib.sha256(path.read_bytes()).hexdigest()!=rec['sha256']: errors.append('DIFFERENT '+str(path.relative_to(root)))
print(f'Checked {len(records)} original files; {len(errors)} errors')
for e in errors:print(e)
sys.exit(1 if errors else 0)
