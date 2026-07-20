# AI-08 AI FinOps Governance Implementation Roadmap

## 1 Project Overview

This project is a one-day hackathon MVP for **AI-08: AI Cost & Usage Governance**.

The final product is a modern enterprise-style AI FinOps dashboard that helps a demo FinOps analyst:

- Track AI usage and token consumption.
- Estimate AI request cost.
- Check team budgets and quotas.
- Recommend lower-cost approved models.
- Detect cost or usage anomalies.
- Produce clear governance decisions: `Allow`, `Warn`, `Block`, or `Require Approval`.
- Show transparent chargeback ownership by team and department.

The approved technology stack is:

- Backend: Python + FastAPI
- Frontend: React + TypeScript
- Database: SQLite
- Charts: Recharts
- AI: OpenAI, Claude, or mocked responses

The MVP must remain intentionally small:

- One backend service.
- One frontend app.
- One SQLite database.
- Five essential database tables.
- Five in-process AI FinOps agents.
- Six REST API endpoints.
- Three UI pages: Dashboard, Submit Request, Request History.

This roadmap is the implementation contract for future development.

## 2 Development Strategy

Build the project vertically from stable foundations to demo polish.

Recommended order:

1. Create the project skeleton.
2. Make the backend start successfully.
3. Create the SQLite schema and seed data.
4. Build core business calculations.
5. Build agents one at a time.
6. Build REST APIs.
7. Create frontend shell and routing.
8. Build Dashboard using real API data.
9. Build Submit Request flow.
10. Add charts and Request History.
11. Strengthen demo scenarios.
12. Polish the UI and run the final demo checklist.

Why this minimizes bugs:

- Database and seed data come before APIs, so API work has stable data to return.
- Business services come before agents, so agents remain simple wrappers over clear logic.
- Agents come before APIs, so request evaluation can be tested before UI integration.
- APIs come before frontend, so the frontend integrates with stable response shapes.
- Dashboard comes before Submit Request polish, so the main demo screen is always presentable.
- Demo data is strengthened before final polish, so charts and tables never look empty.
- The app stays runnable after every milestone, reducing integration surprises at the end.

The guiding principle: build one thin, working product slice before adding breadth.

## 3 Milestones

### Milestone 1: Project Setup

Create the repository structure, backend app shell, frontend app shell, and basic run instructions.

### Milestone 2: Backend Foundation

Create the FastAPI application structure, health endpoint, shared configuration, and response helpers.

### Milestone 3: Database

Create the SQLite database schema using the five approved tables and load minimal seed data.

### Milestone 4: Core Business Services

Implement cost calculation, budget evaluation, model selection, anomaly detection rules, and dashboard aggregation logic.

### Milestone 5: AI Agent Implementation

Implement the five in-process agents and the orchestrator that runs them in sequence.

### Milestone 6: REST APIs

Implement the six approved API endpoints from `API_SPEC.md`.

### Milestone 7: Frontend Foundation

Create the React + TypeScript app shell, navigation, API client, design tokens, and reusable layout components.

### Milestone 8: Dashboard

Build the dashboard page with KPI cards, dashboard sections, recent requests, alerts, and chargeback summary.

### Milestone 9: Submit Request Flow

Build the request form, demo scenario dropdown, auto-fill behavior, submission flow, and request result panel.

### Milestone 10: Charts

Add Recharts visualizations for spend trend, team spend, model usage, and decision breakdown or budget utilization.

### Milestone 11: Demo Data

Create reliable demo scenarios for Normal Request, Budget Warning, Model Routing, Cost Spike, and Require Approval.

### Milestone 12: Final Polish

Polish visual quality, empty/loading states, error handling, demo path, and final presentation readiness.

## 4 Detailed Task Breakdown

Each task should take approximately 15 to 30 minutes. Complete one task before moving to the next.

### Milestone 1: Project Setup

- [ ] Confirm the final scope from `PROJECT_SPEC_AI08.md`, `ARCHITECTURE.md`, `UI_DESIGN.md`, `DATABASE.md`, and `API_SPEC.md`.
- [ ] Inspect the current repository structure.
- [ ] Decide the final root folders for backend and frontend.
- [ ] Create the backend project folder.
- [ ] Create the frontend project folder.
- [ ] Add a short root README note for how to run backend and frontend.
- [ ] Add basic ignore rules for generated files, dependency folders, local databases, and environment files.
- [ ] Confirm the project can be opened from the repository root without path confusion.

### Milestone 2: Backend Foundation

- [ ] Create the FastAPI application entry point.
- [ ] Add backend configuration for app name, environment, database path, and demo mode.
- [ ] Add a basic health endpoint.
- [ ] Add standard response envelope helpers for success and error responses.
- [ ] Define shared enum constants for decision status, risk tier, environment, budget status, model status, anomaly severity, and data classification.
- [ ] Add simple request validation conventions.
- [ ] Add backend error code constants from `API_SPEC.md`.
- [ ] Confirm backend starts locally.
- [ ] Confirm health endpoint returns a successful response.

### Milestone 3: Database

- [ ] Create a database module for SQLite connection handling.
- [ ] Create schema setup for the `teams` table.
- [ ] Create schema setup for the `budgets` table.
- [ ] Create schema setup for the `models` table.
- [ ] Create schema setup for the `usage_events` table.
- [ ] Create schema setup for the `governance_decisions` table.
- [ ] Add essential indexes from `DATABASE.md`.
- [ ] Add a database initialization routine.
- [ ] Add a demo reset routine that clears demo data safely.
- [ ] Add seed data for four teams.
- [ ] Add seed data for one current-month budget per team.
- [ ] Add seed data for four models.
- [ ] Add seed data for historical usage events.
- [ ] Add seed data for historical governance decisions.
- [ ] Confirm the database file is created locally.
- [ ] Confirm seeded record counts are correct.

### Milestone 4: Core Business Services

- [ ] Create a cost calculation service.
- [ ] Calculate total tokens from input and output tokens.
- [ ] Calculate estimated request cost from requested model pricing.
- [ ] Calculate estimated routed cost from recommended model pricing.
- [ ] Calculate estimated savings.
- [ ] Create a budget evaluation service.
- [ ] Calculate current month spend by team.
- [ ] Calculate current month token usage by team.
- [ ] Determine budget status: within budget, near limit, exceeded, or no budget.
- [ ] Determine quota status using token usage.
- [ ] Create a model routing service.
- [ ] Check whether the requested model is approved, restricted, blocked, or inactive.
- [ ] Select a lower-cost approved model for low-risk tasks.
- [ ] Preserve the requested model when routing is not appropriate.
- [ ] Create an anomaly rule service.
- [ ] Detect high token count requests.
- [ ] Detect spend spikes compared with simple baseline data.
- [ ] Detect expensive model usage in low-risk or non-production cases.
- [ ] Create a decision rule evaluator.
- [ ] Map budget, model, and anomaly signals to `allow`, `warn`, `block`, or `require_approval`.
- [ ] Generate a plain-language recommendation string.
- [ ] Generate a short explanation string.
- [ ] Create dashboard aggregation service.
- [ ] Aggregate KPI totals.
- [ ] Aggregate spend trend data.
- [ ] Aggregate budget utilization data.
- [ ] Aggregate team spend data.
- [ ] Aggregate model usage data.
- [ ] Aggregate chargeback summary data.

### Milestone 5: AI Agent Implementation

- [ ] Create the agent folder structure.
- [ ] Build the Usage Collector Agent.
- [ ] Confirm Usage Collector Agent normalizes request fields.
- [ ] Confirm Usage Collector Agent calculates tokens and estimated cost.
- [ ] Build the Budget Policy Agent.
- [ ] Confirm Budget Policy Agent evaluates budget and quota status.
- [ ] Build the Model Router Agent.
- [ ] Confirm Model Router Agent recommends lower-cost model when appropriate.
- [ ] Build the Anomaly Detection Agent.
- [ ] Confirm Anomaly Detection Agent returns severity and reason.
- [ ] Build the Chargeback Agent.
- [ ] Confirm Chargeback Agent returns team and department ownership summary.
- [ ] Build the Agent Orchestrator.
- [ ] Wire agents in the approved sequence.
- [ ] Ensure each agent returns a simple structured output.
- [ ] Ensure the orchestrator returns one final decision object.
- [ ] Test the orchestrator manually with a normal request.
- [ ] Test the orchestrator manually with a budget warning request.
- [ ] Test the orchestrator manually with a model routing request.
- [ ] Test the orchestrator manually with a cost spike request.
- [ ] Test the orchestrator manually with a require approval request.

### Milestone 6: REST APIs

- [ ] Create the API routing structure.
- [ ] Implement `POST /api/demo/load`.
- [ ] Confirm demo load resets and seeds data.
- [ ] Confirm demo load returns counts, teams, models, and message.
- [ ] Implement `POST /api/request`.
- [ ] Validate required request fields.
- [ ] Validate enum values.
- [ ] Validate token values.
- [ ] Validate team and model references.
- [ ] Call the Agent Orchestrator.
- [ ] Persist the usage event.
- [ ] Persist the governance decision.
- [ ] Return the approved response envelope.
- [ ] Implement `GET /api/dashboard`.
- [ ] Return KPI card data.
- [ ] Return spend trend data.
- [ ] Return budget utilization data.
- [ ] Return team spend data.
- [ ] Return model usage data.
- [ ] Return AI recommendation panel data.
- [ ] Return recent requests data.
- [ ] Return active alerts data.
- [ ] Return chargeback summary data.
- [ ] Return reference teams and models.
- [ ] Implement `GET /api/history`.
- [ ] Support date range filter.
- [ ] Support team filter.
- [ ] Support decision status filter.
- [ ] Support model filter.
- [ ] Support environment filter.
- [ ] Support anomaly severity filter.
- [ ] Return summary totals.
- [ ] Implement `GET /api/request/{id}`.
- [ ] Return usage event detail.
- [ ] Return team detail.
- [ ] Return requested and recommended model detail.
- [ ] Return decision detail.
- [ ] Return cost breakdown.
- [ ] Return agent summary.
- [ ] Implement `GET /api/models`.
- [ ] Support optional status filter.
- [ ] Support optional provider filter.
- [ ] Return model display labels.
- [ ] Confirm all endpoints use the standard response format.
- [ ] Confirm all expected business errors return clean messages.
- [ ] Manually test all six endpoints.

### Milestone 7: Frontend Foundation

- [ ] Create the React + TypeScript frontend app.
- [ ] Install only required frontend dependencies.
- [ ] Configure the app to call the FastAPI backend.
- [ ] Create the app shell.
- [ ] Create the sidebar with three navigation items: Dashboard, Submit Request, Request History.
- [ ] Create the top header area.
- [ ] Create frontend API client helpers.
- [ ] Create shared frontend types aligned to `API_SPEC.md`.
- [ ] Create design token references for color, typography, spacing, and status colors.
- [ ] Create reusable `Metric Card` component.
- [ ] Create reusable `Status Badge` component.
- [ ] Create reusable `Chart Card` component.
- [ ] Create reusable `Table` component.
- [ ] Create reusable loading state.
- [ ] Create reusable empty state.
- [ ] Confirm frontend starts locally.
- [ ] Confirm navigation works between three pages.

### Milestone 8: Dashboard

- [ ] Create Dashboard page structure.
- [ ] Add dashboard header with title, subtitle, date range area, and load demo action.
- [ ] Connect Dashboard page to `GET /api/dashboard`.
- [ ] Connect load demo action to `POST /api/demo/load`.
- [ ] Render KPI card for Today's Spend.
- [ ] Render KPI card for Budget Remaining.
- [ ] Render KPI card for Estimated Savings.
- [ ] Render KPI card for Active Alerts.
- [ ] Create Spend Trend chart placeholder area.
- [ ] Create AI Recommendation Panel.
- [ ] Create Budget Utilization section.
- [ ] Create Team Spend section.
- [ ] Create Model Usage section.
- [ ] Create Recent Requests table.
- [ ] Create Active Alerts list.
- [ ] Create Chargeback Summary table.
- [ ] Apply approved visual hierarchy from `UI_DESIGN.md`.
- [ ] Confirm dashboard renders with seeded data.
- [ ] Confirm dashboard does not look empty after demo load.

### Milestone 9: Submit Request Flow

- [ ] Create Submit Request page structure.
- [ ] Create two-column layout: form on left, preview/result on right.
- [ ] Add Demo Scenario dropdown.
- [ ] Define frontend scenario presets for Normal Request.
- [ ] Define frontend scenario presets for Budget Exceeded.
- [ ] Define frontend scenario presets for Model Routing.
- [ ] Define frontend scenario presets for Cost Spike.
- [ ] Define frontend scenario presets for Require Approval.
- [ ] Auto-fill form when scenario changes.
- [ ] Add Request Context fields.
- [ ] Add AI Usage fields.
- [ ] Add Governance Signals fields.
- [ ] Populate team choices from dashboard reference data or demo load data.
- [ ] Populate model choices from `GET /api/models`.
- [ ] Add frontend validation for obvious missing fields.
- [ ] Connect Evaluate Request action to `POST /api/request`.
- [ ] Render Request Result panel after submission.
- [ ] Show decision badge.
- [ ] Show estimated cost.
- [ ] Show budget status.
- [ ] Show recommended model.
- [ ] Show savings.
- [ ] Show anomaly status.
- [ ] Show AI recommendation.
- [ ] Show explanation.
- [ ] Refresh dashboard data after successful submission.
- [ ] Confirm each scenario produces the expected decision style.

### Milestone 10: Charts

- [ ] Install and verify Recharts dependency if not already present.
- [ ] Build Spend Trend chart using dashboard `spend_trend` data.
- [ ] Add tooltip formatting for date, spend, and tokens.
- [ ] Build Team Spend bar chart.
- [ ] Build Model Usage chart.
- [ ] Build Budget Utilization progress or chart visualization.
- [ ] Add decision breakdown chart if time permits within this milestone.
- [ ] Ensure chart colors match `UI_DESIGN.md`.
- [ ] Ensure charts render with empty data without crashing.
- [ ] Ensure charts fit dashboard cards on desktop.
- [ ] Confirm chart labels do not overlap.

### Milestone 11: Demo Data

- [ ] Verify all four demo teams exist.
- [ ] Verify current-month budgets exist for each team.
- [ ] Verify model catalog includes premium, standard, low-cost, and blocked or restricted model.
- [ ] Verify historical data spans at least 7 days.
- [ ] Verify dashboard has at least 15 recent requests available.
- [ ] Verify demo data includes `allow` decisions.
- [ ] Verify demo data includes `warn` decisions.
- [ ] Verify demo data includes `block` decisions.
- [ ] Verify demo data includes `require_approval` decisions.
- [ ] Verify demo data includes model routing savings.
- [ ] Verify demo data includes medium or high anomaly severity.
- [ ] Verify Normal Request scenario returns `allow`.
- [ ] Verify Budget Warning scenario returns `warn` or `block` depending on selected values.
- [ ] Verify Model Routing scenario returns a recommended lower-cost model.
- [ ] Verify Cost Spike scenario returns anomaly severity.
- [ ] Verify Require Approval scenario returns `require_approval`.
- [ ] Verify dashboard updates after each submitted scenario.
- [ ] Verify Request History shows newly submitted requests.

### Milestone 12: Final Polish

- [ ] Review dashboard visual spacing.
- [ ] Review card borders, shadows, typography, and status colors.
- [ ] Ensure navigation labels match the approved three pages.
- [ ] Ensure there are no dead navigation items.
- [ ] Ensure all loading states are acceptable.
- [ ] Ensure all empty states are acceptable.
- [ ] Ensure API errors show readable frontend messages.
- [ ] Ensure request submission cannot double-submit accidentally.
- [ ] Ensure currency formatting is consistent.
- [ ] Ensure token formatting is consistent.
- [ ] Ensure status badges use approved colors and icons.
- [ ] Ensure the demo data button is easy to find.
- [ ] Ensure the first screen immediately looks like a real enterprise dashboard.
- [ ] Run backend locally.
- [ ] Run frontend locally.
- [ ] Execute the full five-minute demo flow.
- [ ] Fix only demo-blocking bugs.
- [ ] Stop adding new features.

## 5 Development Rules

- Always complete one task before moving to the next.
- Never generate more than one module at a time.
- Never modify unrelated files.
- Always keep the application runnable.
- Follow `TASKS.md` before adding or changing functionality.
- Use `PROJECT_SPEC_AI08.md` as the business source.
- Use `ARCHITECTURE.md` for component boundaries.
- Use `DATABASE.md` for schema scope.
- Use `API_SPEC.md` for endpoint behavior and response shapes.
- Use `UI_DESIGN.md` for visual design and page structure.
- Do not add new pages beyond Dashboard, Submit Request, and Request History.
- Do not add new backend endpoints unless the roadmap is explicitly updated.
- Do not add new database tables unless the roadmap is explicitly updated.
- Prefer simple synchronous logic for the MVP.
- Prefer mocked AI behavior unless real provider integration is already working.
- Keep business decisions rule-driven.
- Keep prompt storage limited to prompt summaries.
- Test one scenario after each meaningful backend or frontend change.
- Do not refactor while the demo path is broken.
- Do not optimize before the end-to-end flow works.
- Protect the five-minute demo flow above all else.

## 6 Definition of Done

### Milestone 1: Project Setup

Completed when:

- Backend and frontend folders exist.
- Basic run instructions exist.
- Repository structure is understandable.
- No application code outside the planned structure is needed.

### Milestone 2: Backend Foundation

Completed when:

- FastAPI backend starts locally.
- Health endpoint responds successfully.
- Shared response and error conventions are available.
- Backend constants match approved enums.

### Milestone 3: Database

Completed when:

- SQLite database initializes successfully.
- Five approved tables exist.
- Essential indexes exist.
- Demo seed data loads successfully.
- Record counts are predictable.

### Milestone 4: Core Business Services

Completed when:

- Cost calculations are correct enough for demo usage.
- Budget status can be evaluated.
- Model routing can recommend cheaper approved models.
- Anomaly rules can detect cost or token spikes.
- Decision evaluator can produce all four decision statuses.
- Dashboard aggregates can be generated.

### Milestone 5: AI Agent Implementation

Completed when:

- All five agents exist.
- Orchestrator runs agents in sequence.
- Normal Request, Budget Warning, Model Routing, Cost Spike, and Require Approval scenarios produce expected signals.
- Each agent has one clear responsibility.

### Milestone 6: REST APIs

Completed when:

- All six endpoints from `API_SPEC.md` exist.
- Standard response envelope is used.
- Validation errors are readable.
- Business errors are readable.
- Frontend can retrieve dashboard, history, model, request detail, and decision data.

### Milestone 7: Frontend Foundation

Completed when:

- React app starts locally.
- Sidebar navigation works.
- App shell matches the approved three-page structure.
- Shared API client can call backend.
- Reusable core components exist.

### Milestone 8: Dashboard

Completed when:

- Dashboard renders seeded data from `GET /api/dashboard`.
- KPI cards are visible.
- Recent requests are visible.
- Active alerts are visible.
- Chargeback summary is visible.
- Dashboard looks credible as the first demo screen.

### Milestone 9: Submit Request Flow

Completed when:

- Demo Scenario dropdown auto-fills the form.
- User can submit a request.
- Result panel displays the decision and supporting details.
- At least five demo scenarios can be demonstrated.

### Milestone 10: Charts

Completed when:

- Spend trend chart renders.
- Team spend chart renders.
- Model usage chart renders.
- Budget utilization visual renders.
- Charts are readable and do not break empty states.

### Milestone 11: Demo Data

Completed when:

- Demo data loads reliably.
- Dashboard looks populated.
- Each official demo scenario produces a meaningful result.
- Newly submitted requests appear in dashboard and history.

### Milestone 12: Final Polish

Completed when:

- Full demo works from a clean start.
- Backend and frontend run at the same time.
- No broken links or dead controls are visible.
- UI looks premium and professional enough for judges.
- No new feature work remains before presentation.

## 7 Final Demo Checklist

- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Dashboard loads without errors.
- [ ] Demo data load button works.
- [ ] KPI cards show realistic values.
- [ ] Spend trend chart is populated.
- [ ] Budget utilization section is populated.
- [ ] Team spend section is populated.
- [ ] Model usage section is populated.
- [ ] AI Recommendation Panel shows a useful recommendation.
- [ ] Recent Requests table shows data.
- [ ] Active Alerts section shows at least one meaningful alert.
- [ ] Chargeback Summary shows team and department ownership.
- [ ] Submit Request page loads.
- [ ] Demo Scenario dropdown works.
- [ ] Normal Request returns `Allow`.
- [ ] Budget Warning or Budget Exceeded returns `Warn` or `Block`.
- [ ] Model Routing returns a recommended lower-cost model and savings.
- [ ] Cost Spike returns anomaly severity.
- [ ] Require Approval returns `Require Approval`.
- [ ] Result panel shows decision badge, estimated cost, budget status, recommended model, savings, anomaly status, AI recommendation, and explanation.
- [ ] Request History page loads.
- [ ] Newly submitted requests appear in history.
- [ ] Clicking or viewing request details works if implemented.
- [ ] Error messages are readable.
- [ ] No console errors are visible during the demo path.
- [ ] No placeholder lorem ipsum text remains.
- [ ] No unfinished navigation items are visible.
- [ ] Demo can be completed in under five minutes.

## 8 Nice-to-Have Features

Only attempt these after the full MVP and final demo checklist are complete.

- [ ] Add decision breakdown chart.
- [ ] Add a small sparkline inside KPI cards.
- [ ] Add a request detail modal from Request History.
- [ ] Add export-style button for chargeback summary, even if it only downloads visible data.
- [ ] Add a toggle between token view and cost view in Model Usage.
- [ ] Add subtle row highlight when a new request is submitted.
- [ ] Add richer AI Recommendation Panel messages.
- [ ] Add scenario-specific explanation text in the form preview.
- [ ] Add backend smoke tests for the five scenarios.
- [ ] Add frontend empty-state polish.

## 9 Things to Avoid

Avoid these because they will waste time during a one-day hackathon:

- Do not build microservices.
- Do not add Kubernetes, queues, event buses, or CQRS.
- Do not add login, JWT, OAuth, users, roles, or tenants.
- Do not add more database tables unless absolutely required.
- Do not add generic lookup tables.
- Do not build an admin settings area.
- Do not create separate pages for budgets, models, alerts, or chargeback.
- Do not overbuild approval workflows.
- Do not integrate real cloud cost tools unless everything else is already complete.
- Do not require real OpenAI or Claude credentials for the demo to work.
- Do not store full prompts.
- Do not chase perfect anomaly detection.
- Do not chase perfect financial accuracy.
- Do not add advanced pagination.
- Do not add drag-and-drop interactions.
- Do not add custom animation systems.
- Do not add dark mode.
- Do not redesign the UI during implementation.
- Do not refactor working code during final polish.
- Do not optimize queries before the demo flow works.
- Do not add extra endpoints because they feel nice to have.
- Do not let charts consume time before core request evaluation works.
- Do not present with empty dashboard data.
- Do not continue feature work once the final demo checklist passes.
