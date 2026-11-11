import { unlink } from "node:fs/promises";
import { resolve } from "node:path";

const ownedStateFile = resolve(".local-state", "phase-01-run.json");
let removed = false;
try {
  await unlink(ownedStateFile);
  removed = true;
} catch (error) {
  if (
    !(error instanceof Error) ||
    !("code" in error) ||
    error.code !== "ENOENT"
  )
    throw error;
}
console.log(
  removed
    ? "Reset complete: removed the project-owned Phase 01 run snapshot."
    : "Reset complete: Phase 01 persists no browser data; use the UI Reset action for in-memory runs.",
);
