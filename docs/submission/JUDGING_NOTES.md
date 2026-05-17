# Judging Notes

## One-Line Summary

Instana Config Pilot helps teams generate, validate, compare, and export IBM Instana `configuration.yaml` files through a guided frontend workflow built with IBM Bob.

## Why It Matters

Instana agent configuration files can become large, repetitive, and risky to edit manually. This project reduces that friction by turning YAML configuration work into a visual flow:

- load or upload an Instana-style template
- detect available sensor blocks
- select and configure sensors
- validate missing fields and hardcoded secret risks
- generate `configuration.yaml`
- generate `.env.example`
- compare changes before applying them to an environment

## IBM Bob Usage

IBM Bob IDE was used as the core development partner for:

- architecture exploration
- frontend implementation
- TypeScript refactoring
- documentation generation
- delivery-scope decisions
- final README, runbook, and submission organization

Bob session evidence is included in:

```text
bob_sessions/
```

## Hackathon Pivot

The original idea targeted a broader full-stack implementation with web, backend API, and MCP-ready integration. As BobCoins became a practical constraint, the project pivoted to a frontend-first implementation.

This pivot preserved the core user value while reducing operational complexity and enabling a working proof of concept within hackathon limits.

## Final Delivery Scope

Final functional scope:

- React frontend
- browser-based YAML processing
- static deployment path
- documentation and demo assets

Out of final functional scope:

- backend API
- production persistence
- real Instana API integration
- real secret storage
- watsonx Orchestrate integration

## Optional watsonx Note

The project focuses on IBM Bob IDE as the required hackathon tool. watsonx products were reviewed as optional extension paths, but the final proof of concept does not depend on watsonx Orchestrate or watsonx.ai.
