# Instana Config Pilot

Demo application for IBM Bob: a frontend-first tool for building, validating, comparing, and exporting IBM Instana `configuration.yaml` files from an official-style template.

Instana Config Pilot turns a large YAML configuration file into a guided visual workflow. Instead of editing sensor blocks by hand, the user can load a template, discover available `com.instana.plugin.*` blocks, select the sensors they need, fill operational tags, validate risky values, compare changes, and export the resulting files.

## Features

- **Frontend-first delivery** - The hackathon deliverable is the React application. YAML processing runs in the browser.
- **Instana sensor discovery** - Detects sensor blocks from `configuration.yaml` using `com.instana.plugin.*` keys.
- **Dynamic sensor catalog** - Uses curated metadata for known sensors and creates fallback entries for unknown sensors found in the template.
- **Visual configuration flow** - Select sensors, edit generated fields, and preview the final YAML without manual indentation work.
- **Agent tags** - Supports required operational tags such as `client`, `environment`, `zone`, and `owner`.
- **Secret separation** - Generates `.env.example` placeholders for selected sensors.
- **Validation findings** - Flags missing required values and suspicious hardcoded secrets.
- **YAML comparison** - Compares generated YAML against an uploaded file.
- **Bob demo notes** - Includes an output tab for implementation/demo notes used in the IBM Bob hackathon story.
- **Docker support** - A Compose setup exists for local/development continuity, but the backend is not part of the final deliverable.

## Current Delivery Scope

The current delivery is **frontend-first**.

The production demo should be presented as a browser-based React tool. The core logic lives in `frontend/src/lib` and runs locally in the user's browser:

- sensor detection
- catalog enrichment
- YAML generation
- `.env.example` generation
- validation
- visual diff generation

The repository still contains a FastAPI backend from earlier prototype iterations. That backend is useful as historical/reference code, and it is still present in `docker-compose.yml`, but **it is excluded from the hackathon delivery scope**. Do not present the backend as part of the final functional architecture.

## Hackathon Evolution

The first intention was to build a complete full-stack demo with:

- a web frontend,
- a FastAPI backend,
- API-based YAML processing,
- and an MCP-ready integration path for agentic workflows.

During the IBM Bob hackathon, BobCoins became a practical constraint. Instead of spending the remaining budget on a broader but unfinished full-stack implementation, the project pivoted to a smaller functional delivery: a frontend-first version where the core Instana configuration workflow works directly in the browser.

That pivot is part of the project story. It shows a real engineering tradeoff: preserve the product value, reduce moving parts, and deliver a working demo under time and resource constraints.

## Architecture

```text
instana_config_pilot/
|-- frontend/                 # Main deliverable: React + TypeScript + Vite
|   |-- src/
|   |   |-- App.tsx           # Main single-page experience
|   |   |-- data/             # Default Instana template
|   |   |-- lib/              # Client-side YAML/sensor engines
|   |   |-- components/       # Legacy/reusable UI components
|   |   `-- types/            # TypeScript types
|   |-- Dockerfile            # Static Nginx frontend image
|   `-- package.json
|
|-- backend/                  # Reference/prototype FastAPI code, excluded from delivery
|   |-- app/                  # API routers, models, services
|   `-- Dockerfile
|
|-- instana_docs/             # IBM Instana source material and YAML templates
|-- AGENTS.md                 # Non-obvious rules for Bob/AI agents
|-- DEMO_RUNBOOK.md           # Step-by-step demo guide
|-- docker-compose.yml        # Local/development transitional setup
|-- MVP_ARCHITECTURE.md       # Frontend-first architecture notes
`-- README.md
```

### Key Documentation

- [AGENTS.md](./AGENTS.md) - Critical project constraints for Bob/AI agents.
- [DEMO_RUNBOOK.md](./DEMO_RUNBOOK.md) - Presentation flow, talking points, and troubleshooting.
- [MVP_ARCHITECTURE.md](./MVP_ARCHITECTURE.md) - Why the project pivoted to a client-side architecture.
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Earlier full-system architecture notes.
- [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md) - Technical details from the original planning phase.
- [INSTRUCCIONES_FINALES.md](./INSTRUCCIONES_FINALES.md) - Historical final instructions from an earlier backend-oriented iteration.

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Option 1: Frontend Development Start

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: http://localhost:5173

This is the recommended path for working on the actual hackathon deliverable.

### Option 2: Docker Compose, Transitional Local Setup

```bash
docker-compose up --build
```

Current Compose services:

- Frontend: http://localhost
- Backend reference API: http://localhost:8001
- Backend reference docs: http://localhost:8001/api/docs

Important: Compose still starts the backend because the file reflects an earlier integration path. For judging/demo purposes, explain that the functional delivery is the frontend.

## User Guide

### Build an Instana Configuration

1. Open the app.
2. Choose the default YAML template or upload a `.yaml` / `.yml` file.
3. Confirm the detected sensor count in the source panel.
4. Fill the required tags:
   - `client`
   - `environment`
   - `zone`
   - `owner`
5. Search or filter the available sensors.
6. Enable one or more sensors.
7. Select an enabled sensor and complete its fields.
8. Review validation findings.
9. Copy or download the generated `configuration.yaml`.

### Generate Environment Variables

1. Enable sensors that require credentials.
2. Open the `.env.example` output tab.
3. Download or copy the generated placeholders.
4. Fill secret values outside the repository.

### Compare YAML Files

1. Switch to **Compare** mode.
2. Upload another YAML file as File B.
3. Review the visual diff against the generated YAML.
4. Check validation findings for the uploaded candidate.

### Use Demo Values

The app includes a demo action that pre-fills tags and an IBM MQ scenario. Use this during presentations to avoid typing every field live.

## Demo Data

The app ships with:

- A default Instana-style template at `frontend/src/data/default-template.yaml`.
- Curated sensor metadata for common sensors such as:
  - Host Agent
  - Operating System
  - IBM MQ
  - IBM MQ Managed File Transfer
  - IBM DB2
  - Apache HTTPD
  - NGINX
  - Redis
  - PostgreSQL
  - Kafka
- Dynamic fallback support for additional `com.instana.plugin.*` blocks discovered in the source YAML.
- Demo tags and IBM MQ sample values available from the UI.

## Technology Stack

### Frontend, Delivery Scope

- React 18
- TypeScript
- Vite
- Tailwind CSS and custom CSS
- `diff` for line-based comparison
- Local TypeScript modules for YAML generation and validation

### Backend, Reference Only

- FastAPI
- Pydantic
- PyYAML
- Python service modules for parsing, comparison, validation, and generation

The backend remains in the repository but is excluded from the final delivery scope.

## Core Frontend Modules

- `frontend/src/lib/sensorDetector.ts` - Extracts `com.instana.plugin.*` blocks and tags from YAML text.
- `frontend/src/lib/sensorCatalog.ts` - Defines known sensors and creates metadata for unknown sensors.
- `frontend/src/lib/yamlGenerator.ts` - Produces the final `configuration.yaml`.
- `frontend/src/lib/envGenerator.ts` - Produces `.env.example` placeholders.
- `frontend/src/lib/validator.ts` - Reports missing fields and hardcoded-secret risks.
- `frontend/src/lib/diffEngine.ts` - Builds the visual line diff.

## Testing and Validation

### Frontend Build

```bash
cd frontend
npm run build
```

### Frontend Lint

```bash
cd frontend
npm run lint
```

### Backend Syntax Check, Reference Only

```bash
cd backend
python -m compileall app
```

## Production Deployment

For the deliverable, deploy the frontend as a static site:

```bash
cd frontend
npm run build
```

Deploy the generated `frontend/dist` folder to a static host or serve it through Nginx.

The included `frontend/Dockerfile` builds the app and serves it with Nginx. The backend container is not required for the final frontend-first demo.

## Troubleshooting

### Frontend will not start

- Ensure Node.js 18+ is installed.
- Run `npm install` inside `frontend`.
- Check whether port `5173` is already in use.

### Build fails in PowerShell

If PowerShell blocks `npm.ps1`, run:

```bash
npm.cmd run build
```

### No sensors appear

- Confirm the YAML source includes `com.instana.plugin.*` blocks.
- Use the default template to verify the detector.
- Check `frontend/src/lib/sensorDetector.ts` if changing detection behavior.

### Generated YAML has missing values

- Review the validation findings panel.
- Complete required tags and required sensor fields.
- Use `${ENV_VAR}` placeholders for secrets instead of hardcoded values.

### Docker Compose starts backend

That is expected with the current transitional Compose file. The backend is reference code and should not be presented as part of the final delivery.

## Contributing

1. Create a feature branch.
2. Keep changes scoped to the frontend unless explicitly reviving backend work.
3. Preserve existing authorship and `Made with Bob` notes.
4. Run frontend build/lint checks before submitting.
5. Update documentation when behavior changes.

## License

This project currently documents MIT intent in the original README text. Add or update a `LICENSE` file if the repository is prepared for public distribution.

## Authors

- **Yohel** - *Desarrollo inicial*

## Acknowledgements

- IBM Instana for the configuration documentation and templates.
- IBM Bob for the hackathon development workflow.
- The IBM Galaxium Travels demo repository for documentation structure inspiration.
- The React, Vite, TypeScript, and FastAPI communities.

---

Built for a practical IBM Bob hackathon demo: from Instana YAML complexity to a guided configuration workflow.
