# Submission Checklist

## Project

- Project name: Instana Config Pilot
- Hackathon: IBM Bob Hackathon, May 2026
- Main required tool: IBM Bob IDE
- Delivery architecture: Frontend-first React application
- Backend status: Reference/prototype code only, excluded from final delivery scope

## Repository Contents

- [x] Main project README
- [x] AGENTS.md with project-specific Bob/AI agent rules
- [x] Demo runbook
- [x] Frontend source code
- [x] Instana template and reference documentation
- [x] Bob task session export folder
- [x] Demo screenshots and walkthrough video
- [x] Data usage declaration
- [x] License file

## Required Bob Evidence

- [x] `bob_sessions/` folder exists
- [x] Exported Bob IDE task history Markdown included
- [x] Bob task session consumption summary screenshots included
- [x] `bob_sessions/README.md` explains the included files

## How To Run

Recommended local run:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Production build check:

```bash
cd frontend
npm run build
```

Docker static frontend:

```bash
docker build -t instana-config-pilot-frontend ./frontend
docker run --rm -p 8080:80 instana-config-pilot-frontend
```

Open:

```text
http://localhost:8080
```

## Demo Assets

Demo evidence is stored in:

```text
docs/demo-assets/
```

Included:

- app home screenshot
- sensor catalog screenshot
- generated YAML screenshot
- generated `.env.example` screenshot
- compare mode screenshot
- demo walkthrough video

## Final Scope Notes

The original project direction included a web frontend, backend API, and MCP-ready path. During the hackathon, BobCoins became a practical constraint, so the project pivoted to a frontend-first delivery that preserves the core value: generate, validate, compare, and export Instana configuration files from the browser.

The backend remains in the repository as historical/reference code and should not be presented as part of the final functional architecture.

## Pre-Submission Review

- [ ] Confirm `bob_sessions/` contains no real credentials, tokens, API keys, or private data
- [ ] Confirm `.env` files are not committed
- [ ] Confirm demo video size is acceptable for the hosting platform
- [ ] Confirm final repository includes all new documentation files
- [ ] Confirm frontend build passes before final submission
