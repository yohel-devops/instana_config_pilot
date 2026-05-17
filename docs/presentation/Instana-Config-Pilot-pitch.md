# Instana Config Pilot

IBM Bob Hackathon Pitch

## 1. Problem

IBM Instana agent configuration often depends on large `configuration.yaml` files.

Each server or environment can require different sensors, tags, credentials, and tuning values. Editing those YAML files manually creates risk:

- indentation mistakes
- incomplete sensor fields
- hardcoded secrets
- inconsistent tags
- difficult reviews before applying changes

The challenge is not only generating YAML. The real challenge is creating configuration that is correct, consistent, secure, and easy to review before it touches a real environment.

## 2. Solution

Instana Config Pilot is a frontend-first tool that turns Instana YAML configuration into a guided visual workflow.

The user can:

- load an Instana-style template
- detect available `com.instana.plugin.*` sensor blocks
- select and configure sensors visually
- fill required operational tags
- validate missing values and hardcoded-secret risks
- generate `configuration.yaml`
- generate `.env.example`
- compare generated YAML against another file

## 3. Why It Matters

This helps SRE, DevOps, and platform teams move faster while reducing configuration risk.

Instead of editing long YAML files directly, teams get a repeatable workflow that makes configuration changes easier to understand, safer to review, and faster to produce.

## 4. IBM Bob Usage

IBM Bob IDE was the core development partner for the project.

Bob helped with:

- understanding the existing Instana configuration material
- planning the original full-stack architecture
- implementing frontend and backend prototypes
- refactoring toward a frontend-first MVP
- generating and organizing documentation
- preparing final delivery assets for judging

Bob session exports and screenshots are included in `bob_sessions/`.

## 5. Hackathon Pivot

The original goal was a complete full-stack solution:

- web frontend
- backend API
- MCP-ready integration path

During the hackathon, BobCoins became a practical constraint. The team made a deliberate engineering decision: focus the remaining effort on the workflow that mattered most.

The result is a functional frontend-first delivery where YAML detection, validation, generation, and comparison run directly in the browser.

This pivot preserved product value while reducing deployment complexity.

## 6. Architecture

Final delivery architecture:

```text
React + TypeScript + Vite
        |
        v
Client-side YAML and sensor engines
        |
        v
Generated configuration.yaml + .env.example + visual diff
```

Core modules:

- `sensorDetector.ts`
- `sensorCatalog.ts`
- `yamlGenerator.ts`
- `envGenerator.ts`
- `validator.ts`
- `diffEngine.ts`

The backend remains in the repository as reference/prototype code, but it is excluded from the final functional delivery.

## 7. Demo Workflow

Demo path:

1. Open the app.
2. Load the default Instana template.
3. Show detected sensor blocks.
4. Fill tags: `client`, `environment`, `zone`, `owner`.
5. Enable an IBM MQ sensor.
6. Review validation findings.
7. Generate `configuration.yaml`.
8. Generate `.env.example`.
9. Compare against another YAML file.

## 8. Data and Security

The project uses public/reference Instana configuration material and synthetic demo values.

It does not use:

- client data
- personal information
- social media data
- company confidential data
- real production credentials

Sensitive fields are represented through environment variable placeholders such as `${IBMMQ_PASSWORD}`.

## 9. Impact

Instana Config Pilot reduces the time and risk involved in preparing Instana agent configuration.

It supports:

- faster configuration creation
- safer reviews
- better secret handling
- more consistent operational tags
- a clearer path from template to usable YAML

## 10. Next Steps

Future improvements:

- add unit tests for the frontend engines
- improve nested YAML rendering for more sensors
- add a frontend-only export bundle
- create reusable demo templates
- optionally revisit API/MCP integration after the MVP

## Closing

Instana Config Pilot shows how IBM Bob can help turn an operational pain point into a working proof of concept quickly.

The project started with an ambitious full-stack vision, adapted under real hackathon constraints, and delivered a focused tool that makes Instana configuration safer and easier to produce.
