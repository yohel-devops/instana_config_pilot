# Data Usage

## Data Sources

This project uses configuration-oriented reference material for IBM Instana:

- IBM Instana documentation included under `instana_docs/`
- Instana-style `configuration.yaml` templates included in the repository
- Project-specific demo values created for the IBM Bob hackathon

The application is designed to process YAML configuration text provided by the user in the browser.

## Data Not Used

This project does not use:

- client data
- personal information
- social media data
- company confidential data
- production secrets
- real customer credentials

## Demo Data

Demo values such as `IBM`, `PROD`, `PAYMENTS`, `MONITORING`, sample hostnames, sample queue manager names, and `${ENV_VAR}` placeholders are synthetic and used only to demonstrate the workflow.

## Credentials and Secrets

The project intentionally avoids storing real secrets in generated YAML. Sensitive fields should use environment variable placeholders such as:

```text
${IBMMQ_PASSWORD}
${DB2_PASSWORD}
${KAFKA_PASSWORD}
```

Generated `.env.example` output is a template only. Real values should be filled outside the repository and should not be committed.

## Public Repository Note

Before publishing or submitting the repository, review:

- `bob_sessions/`
- `.env.example`
- `instana_docs/`
- screenshots and videos under `docs/demo-assets/`

Remove any accidental credentials, tokens, private emails, or sensitive environment details before final submission.
