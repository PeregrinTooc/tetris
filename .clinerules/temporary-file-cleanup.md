## Brief overview

This rule mandates cleanup of temporary helper files created during task investigation and debugging. Applies to all tasks in this project to keep the repository clean.

## Temporary file management

- Always delete temporary files created for debugging, investigation, or verification at task completion
- Temporary files include: test output captures, debugging scripts, intermediate analysis files, temporary data dumps
- Examples of temporary files to clean up:
    - `specific-e2e-output.txt` - captured test output for analysis
    - `fluid-sizing-test.txt` - single-spec test output
    - `scripts/run-cypress-filtered.sh` - debugging/workaround scripts that don't solve the actual issue
    - Any `*.tmp`, `*.debug`, `*.output` files created during investigation

## When to keep files

- Permanent documentation (in `docs/` directory) explaining findings should be kept
- Test files, source code, and configuration files are permanent
- Scripts that provide ongoing value to the project should remain
- If unsure whether a file should be kept, ask before deleting

## Task completion checklist

- Before using `attempt_completion`, verify all temporary helper files have been removed
- Use `rm` command to clean up temporary files
- Ensure only meaningful, permanent artifacts remain in the repository
