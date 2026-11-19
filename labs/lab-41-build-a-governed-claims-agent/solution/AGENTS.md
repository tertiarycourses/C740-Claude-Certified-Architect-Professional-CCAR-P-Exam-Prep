# Project rules for any AI coding assistant

- Claude model: claude-haiku-5-5 through the official anthropic Python SDK, max_tokens 4096, no temperature.
- All data comes from harbour.json, a fictional sandbox. Never invent policyholders, policies or claims.
- Governance rules live in code (guards.py), never only in a prompt.
- Never add a delete, export or policy-update tool.
- Policyholder personal data never goes to Claude: every tool result passes through redact() first.
- Run Python with `uv run`.
- Never open, print or ask for .env or the API key.
