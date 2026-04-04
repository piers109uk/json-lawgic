# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Json Lawgic is a legal-tech experiment with two independent components:
- **Frontend**: Next.js 15 app in `frontend/` (pnpm). Fully static — reads pre-baked JSON data from `frontend/public/`.
- **Backend pipeline**: Python 3.12 batch pipeline (uv) that uses LLMs to convert legal statutes into JSON Logic. Not a web server — generates data files.

### Running Services

- **Frontend dev server**: `cd frontend && pnpm dev` (serves on port 3000)
- **Backend pipeline**: `cd /workspace && source .venv/bin/activate && python -m json_lawgic.law_pipeline` — requires `OPENAI_API_KEY` in `.env` at repo root. Only needed when regenerating law interpretations.

### Lint / Build / Test

- **Frontend lint**: `cd frontend && pnpm lint` (ESLint via Next.js; one pre-existing `@typescript-eslint/no-explicit-any` warning)
- **Frontend build**: `cd frontend && pnpm build`
- **Python lint**: `source .venv/bin/activate && ruff check .` (pre-existing unused-import warnings in the codebase)
- No automated test suites exist in either frontend or backend.

### Key Caveats

- `uv` must be installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`) and on PATH (`$HOME/.local/bin`).
- pnpm will warn about ignored build scripts for `core-js` and `sharp`. This is expected and does not block the build.
- The backend pipeline requires an `OPENAI_API_KEY` environment variable. The frontend runs independently without any API keys.
- No database or Docker is needed — all data is static JSON files.
