# AI-08 AI FinOps Governance

One-day hackathon MVP for AI Cost & Usage Governance.

The platform will track AI usage, token consumption, model selection, budgets, cost anomalies, and chargeback reporting using:

- Backend: Python + FastAPI
- Frontend: React + TypeScript
- Database: SQLite
- Charts: Recharts
- AI: OpenAI, Claude, or mocked responses

## Project Structure

- `backend/` - FastAPI application.
- `frontend/` - React + TypeScript application.
- `.devcontainer/` - GitHub Codespaces setup.
- Project docs are kept at the repository root.

## Run In GitHub Codespaces

After the Codespace opens, dependencies should install automatically through the devcontainer post-create command.

If you need to install manually:

```bash
python -m pip install -r backend/requirements.txt
cd frontend
npm install
```

Run the backend:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run the frontend in a second terminal:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Default local URLs:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Current Status

Milestone 1 is a project setup skeleton only. Business logic, database schema, and REST APIs begin in later milestones after approval.
