#!/usr/bin/env python3
"""Validate shipped proposed fixture files; not a substitute for runtime Zod/tests."""
import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]/'specs'
s=json.loads((r/'scenarios.json').read_text())
w=json.loads((r/'workloads.json').read_text())
e=json.loads((r/'experiment.schema.json').read_text())
m=json.loads((r/'metrics-test-vectors.json').read_text())
assert len(s)>=8 and len(w)>=3 and e['properties']['schemaVersion']['const']==1
assert all(x['schemaVersion']==1 for x in s+w)
assert len(set(x['id'] for x in s))==len(s)
assert len(set(x['id'] for x in w))==len(w)
ws={x['id'] for x in w}
assert all(x['workloadId'] in ws for x in s)
assert all(len({o['id'] for o in x['operations']})==len(x['operations']) for x in w)
assert all(isinstance(op['arrivalAtMs'],int) and op['arrivalAtMs']>=0 for x in w for op in x['operations'])
assert all(v['schemaVersion']==1 and isinstance(v['seed'],str) for v in s)
assert m and all('name' in x and 'expected' in x for x in m)
print(f'Validated specs: {len(s)} scenarios, {len(w)} workloads, {len(m)} metric vectors, experiment schema v1.')
