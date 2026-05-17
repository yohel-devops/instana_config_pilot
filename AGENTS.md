# AGENTS.md

This repository is an IBM Bob hackathon demo. It is meant to mimic a practical enterprise configuration workflow for IBM Instana, not a fully hardened production system.

Use this file as guidance for Bob, Codex, and other AI agents working in the repository.

## Critical Non-Obvious Patterns

### Delivery Scope

- The **frontend is the deliverable**.
- The backend exists in the repository, but it is **excluded from the current hackathon delivery**.
- Do not describe the final architecture as backend-dependent.
- If documentation mentions `docker-compose.yml`, explain that Compose still starts backend as transitional/reference infrastructure.
- The project originally aimed for a fuller web + API + MCP architecture, but pivoted to frontend-first when BobCoins became a limiting resource.
- Frame that pivot as an engineering tradeoff under hackathon constraints, not as an apology.

### Authorship and Generated Notes

- Do not remove or rewrite existing authorship.
- Keep `Yohel - Desarrollo inicial` intact.
- Do not remove or modify `# Made with Bob`, `// Made with Bob`, or similar Bob notes in files.
- Preserve Bob-related demo narrative unless the user explicitly asks to change it.

### Frontend Architecture

- Main app entry: `frontend/src/App.tsx`.
- The app currently behaves as a single-page frontend workflow.
- Core business logic lives in `frontend/src/lib`.
- The default YAML template is imported as raw text from `frontend/src/data/default-template.yaml`.
- The browser handles parsing, catalog enrichment, YAML generation, `.env.example` generation, validation, and visual diffing.

### Sensor Detection

- Sensor detection is based on `com.instana.plugin.*` blocks.
- Known sensors come from `SENSOR_CATALOG`.
- Unknown sensors should be preserved through dynamic metadata generation, not dropped.
- Do not assume every sensor has a curated catalog entry.

### YAML Generation

- `yamlGenerator.ts` creates the output YAML from selected sensors and tags.
- IBM MQ has special rendering logic.
- Generated secrets should use `${ENV_VAR}` placeholders when possible.
- Do not hardcode credentials in examples unless clearly shown as an anti-pattern.

### Validation

- Validation currently focuses on required tags, required sensor fields, and hardcoded secret warnings.
- Findings are user guidance, not a full IBM Instana schema validator.

### Backend Reference Code

- Backend code lives in `backend/app`.
- It includes parser/generator/validator services and FastAPI routers.
- Treat it as prototype/reference code unless the user explicitly asks to revive backend delivery.
- Backend commands should be documented as reference checks, not required demo steps.

## Commands

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd run build
npm.cmd run lint
```

### Backend, Reference Only

```bash
cd backend
python -m compileall app
```

### Docker, Transitional Local Setup

```bash
docker-compose up --build
docker-compose down
```

Remember: Compose currently starts backend, but final delivery messaging should remain frontend-first.

## Documentation Rules

- Keep README focused on what the project currently is.
- Use `DEMO_RUNBOOK.md` for presentation flow and talking points.
- Use `MVP_ARCHITECTURE.md` for the frontend-first architectural rationale.
- If historical docs contradict current scope, call them historical instead of silently repeating outdated claims.
