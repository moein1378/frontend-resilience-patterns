# Rollback runbook — planned

For later deployed releases, identify last verified git tag and GitHub Pages artifact, redeploy known-good artifact and run smoke, document incident/root cause, preserve run schema migration compatibility. A new push to the previous source commit is not an invisible rollback; log the deployment revision. No automatic rollback exists in the initial handoff.
