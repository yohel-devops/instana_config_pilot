# Demo Runbook: Instana Config Pilot

This runbook gives a concise presentation path for the IBM Bob hackathon demo.

## Demo Goal

Show how Instana Config Pilot turns a large IBM Instana `configuration.yaml` template into a guided frontend workflow for SRE, DevOps, or platform teams.

Hosted demo:

- https://instana-config-pilot.gamingraccoon.com/

The key message:

> We reduce manual YAML editing risk by detecting sensors, guiding configuration, separating secrets, validating output, and comparing generated changes before they reach an Instana agent.

## Scope Reminder

- Present the **frontend** as the functional deliverable.
- The backend remains in the repository as prototype/reference code.
- If using Docker Compose, mention that it still starts backend because the compose file reflects an earlier transitional setup.

## Hackathon Story

The original idea was broader: build a full-stack application with a web UI, API backend, and an MCP-ready integration path. That direction is still visible in the repository through the backend code and earlier architecture documents.

During the hackathon, IBM Bob started running low on BobCoins. The team made a deliberate scope decision: instead of forcing a full-stack demo that might not be reliable, the project pivoted to a frontend-first implementation that preserved the most important user value.

Suggested talking point:

> The pivot was not a failure of the idea; it was a delivery decision. We kept the workflow that matters most for the demo: detect Instana sensors, configure them visually, validate risky values, and export usable YAML from the browser.

## Pre-Demo Checklist

1. Install Node.js 18+.
2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Run a production build:

```bash
npm run build
```

4. Run lint:

```bash
npm run lint
```

Warnings may exist in the current prototype; call out only blocking failures.

## Start the Demo

Recommended hosted demo:

- https://instana-config-pilot.gamingraccoon.com/

Local frontend-first start:

```bash
cd frontend
npm run dev
```

Open:

- http://localhost:5173

Alternative Docker start:

```bash
docker-compose up --build
```

Open:

- http://localhost

## Five-Minute Demo Script

### 1. Open With the Problem

Explain that Instana agent configuration can become a large YAML file with many sensor blocks, credentials, and indentation-sensitive sections.

Suggested talking point:

> Editing this manually is risky. A small indentation mistake or hardcoded password can break monitoring or create a security issue.

### 2. Show Template Loading

Point to the source/template panel.

Show:

- default Instana-style template
- detected sensor count
- option to upload another YAML file

Suggested talking point:

> The app starts from a real configuration template and discovers available `com.instana.plugin.*` blocks.

### 3. Fill Operational Tags

Complete:

- `client`
- `environment`
- `zone`
- `owner`

Suggested values:

- client: `IBM`
- environment: `PROD`
- zone: `PAYMENTS`
- owner: `MONITORING`

Suggested talking point:

> These tags become part of the host agent configuration, giving operations teams consistent metadata.

### 4. Enable a Sensor

Use the search box and pick a recognizable sensor, preferably IBM MQ.

Click the demo values button if available to avoid live typing.

Suggested talking point:

> The catalog knows important fields for common sensors, but it can also preserve unknown plugin blocks discovered in the template.

### 5. Show Validation

Remove or leave a required field blank, then show the validation findings.

Suggested talking point:

> The validation layer catches missing required values and warns when secret-like fields are hardcoded instead of using environment variables.

### 6. Show Generated YAML

Open the `configuration.yaml` tab.

Point out:

- generated header
- host tags
- enabled sensor block
- environment variable placeholders

Suggested talking point:

> The user gets clean YAML output without manually managing spacing or rebuilding the sensor block from scratch.

### 7. Show `.env.example`

Open the `.env.example` tab.

Suggested talking point:

> Secrets are separated from configuration. The generated `.env.example` tells the operator what needs to be supplied without storing sensitive values in the YAML.

### 8. Show Compare Mode

Switch to Compare mode and upload another YAML file if one is available.

Suggested talking point:

> Before applying changes, the team can compare the generated file against another candidate and review differences visually.

### 9. Close With Bob Story

Open Bob notes if useful.

Suggested talking point:

> IBM Bob helped move from idea to working demo: architecture exploration, frontend implementation, validation logic, and documentation cleanup.

## Expected Outputs

- `configuration.yaml`
- `.env.example`
- optional `bob-notes.md`

## Troubleshooting

### Frontend Does Not Start

Run:

```bash
cd frontend
npm install
npm run dev
```

Check whether port `5173` is already in use.

### PowerShell Blocks npm

Use:

```bash
npm.cmd run dev
npm.cmd run build
```

### Docker Shows Backend Logs

That is expected with the current Compose file. The backend is not the delivery focus.

### Sensor Count Looks Wrong

Use the default template first. If a custom upload has no `com.instana.plugin.*` keys, the detector may fall back to the curated catalog.

### Validation Shows Errors

That is expected until required tags and required sensor fields are completed.

## Post-Demo Notes

Good follow-up improvements:

- Add unit tests for `frontend/src/lib`.
- Create a frontend-only Docker Compose profile.
- Add export bundle support directly in the frontend.
- Improve YAML generation for nested sensor structures beyond IBM MQ.
- Add sample YAML files for repeatable demos.
