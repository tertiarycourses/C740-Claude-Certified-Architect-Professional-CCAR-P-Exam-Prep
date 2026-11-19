# Project rules for any AI coding assistant

- Claude model: claude-haiku-5-5 through the official anthropic Python SDK, max_tokens 4096, no temperature.
- A response can hold several text blocks: always read every text block.
- All policy text comes from policies/. Never invent a policy, a number or a source.
- Retrieval is plain Python: no embeddings service and no extra packages.
- Run Python with `uv run`.
- Never open, print or ask for .env or the API key.
- eval_set.json is the golden set. Never edit it to make a test pass: fix the code.
