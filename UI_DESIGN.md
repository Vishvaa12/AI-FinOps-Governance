# AI-08 AI FinOps Governance UI Design

## 1 Design Philosophy

The product should feel like a serious enterprise SaaS dashboard: calm, information-dense, fast to scan, and visually polished. The design language should borrow from tools such as Azure Portal, Datadog, Grafana, AWS Console, GitHub, and Microsoft enterprise products.

The interface should prioritize operational clarity over decoration. Judges should understand the product within the first 10 seconds: this platform tracks AI spend, monitors token usage, enforces budget policies, recommends cheaper models, detects anomalies, and summarizes chargeback ownership.

Design principles:

- Dashboard first, not landing-page first.
- Use compact, professional layouts with strong hierarchy.
- Keep the navigation minimal.
- Use plain enterprise language.
- Make cost, risk, and decision status visually obvious.
- Use restrained color and avoid flashy visuals.
- Make the demo path feel guided without adding complex interactions.
- Treat charts, tables, and status badges as the main visual system.

The UI should look premium because it is precise, not because it is decorative.

## 2 Color Palette

Use a professional light enterprise palette with high contrast, subtle surfaces, and selective status color. The product should feel crisp, modern, and dashboard-oriented.

**Primary**

- Deep Azure: `#2563EB`
- Used for primary actions, active navigation, selected filters, and key focus states.

**Secondary**

- Graphite: `#334155`
- Used for secondary buttons, neutral controls, labels, and supporting UI elements.

**Success**

- Enterprise Green: `#16A34A`
- Used for allowed decisions, healthy budgets, successful routing, and positive savings.

**Warning**

- Amber: `#D97706`
- Used for budget warnings, quota near-limit states, and medium-severity alerts.

**Danger**

- Red: `#DC2626`
- Used for blocked decisions, exceeded budgets, high anomaly severity, and unavailable models.

**Info**

- Cyan Blue: `#0891B2`
- Used for recommendation panels, model routing insight, and informational callouts.

**Background**

- App Background: `#F8FAFC`
- Used for the main application canvas.

**Surface**

- Primary Surface: `#FFFFFF`
- Secondary Surface: `#F1F5F9`
- Used for cards, tables, panels, and grouped controls.

**Border**

- Standard Border: `#E2E8F0`
- Strong Border: `#CBD5E1`
- Used for cards, dividers, form inputs, tables, and chart containers.

**Text Colors**

- Primary Text: `#0F172A`
- Secondary Text: `#475569`
- Muted Text: `#64748B`
- Disabled Text: `#94A3B8`
- Inverse Text: `#FFFFFF`

The palette should not feel monochrome. Status colors should appear only where they carry meaning.

## 3 Typography

**Font Family**

Use a modern system font stack with an enterprise feel:

- Segoe UI
- Inter
- SF Pro Display
- Arial
- sans-serif fallback

If using only system fonts for the hackathon, Segoe UI is enough and fits the Microsoft enterprise SaaS style.

**Heading Sizes**

- Page title: 28px, semibold
- Section heading: 18px, semibold
- Card title: 14px, semibold
- Table heading: 12px, semibold, uppercase optional

**Body Sizes**

- Default body: 14px
- Secondary body: 13px
- Small metadata: 12px
- Table body: 13px

**Button Text**

- Primary button: 14px, semibold
- Secondary button: 14px, medium
- Compact icon button tooltip: 12px

**Metric Numbers**

- KPI value: 28px to 32px, semibold
- Large currency value: 32px, semibold
- Inline metric value: 16px, semibold

Use tabular numbers where possible for metrics, currency, token counts, and percentages. This makes dashboard values feel stable and professional.

## 4 Layout

### Overall Page Layout

The application should use a fixed enterprise console layout:

- Left sidebar for primary navigation.
- Top navigation bar for page title, date range, demo scenario action, and user context.
- Main content area for dashboard sections, forms, charts, and tables.

The first screen should be the Dashboard, not a marketing page.

### Sidebar

The sidebar should be narrow, calm, and utilitarian.

- Width: approximately 240px on desktop.
- Contains product name, compact logo mark, and three navigation items.
- Navigation items include icon, label, and active state.
- Active page uses primary color accent and subtle surface highlight.
- Bottom area can show environment label such as "Hackathon Demo" or "AI-08 MVP".

### Top Navigation

The top bar should provide operational context, not extra navigation.

Recommended contents:

- Current page title.
- Short subtitle such as "AI spend, tokens, budgets, routing, and chargeback".
- Date range selector.
- Demo data button.
- Optional compact user pill such as "FinOps Analyst".

### Content Area

The content area should use a maximum readable width while still feeling like a dashboard.

- Desktop content should be full width with comfortable margins.
- Dashboard uses a 12-column grid.
- Main charts span wider columns.
- Smaller operational panels sit in right-side columns.
- Tables should use the full available width.

### Cards

Cards should be clean and compact.

- Border radius: 8px.
- White surface.
- Light border.
- Subtle shadow only if needed.
- No nested cards.
- Each card should have a clear title, one primary insight, and compact supporting metadata.

### Spacing

- Page padding: 24px.
- Card gap: 16px.
- Section gap: 20px to 24px.
- Card internal padding: 16px to 20px.
- Dense table row height: 44px to 52px.

The layout should feel dense enough for enterprise use but not cramped.

### Responsive Behavior

For tablets and smaller screens:

- Sidebar collapses to an icon rail or top menu.
- KPI cards stack into two columns.
- Charts stack vertically.
- Tables remain horizontally scrollable if needed.
- Submit Request form becomes a single-column layout.

For the hackathon demo, desktop should be the primary optimization target.

## 5 Navigation

Only three pages should appear in navigation:

1. Dashboard
2. Submit Request
3. Request History

Everything else appears as a dashboard section. Budgets, model usage, active alerts, recommendations, and chargeback should not be separate navigation pages.

### Dashboard

Main command center for spend, budget, tokens, anomalies, model routing, recent requests, and chargeback.

### Submit Request

Guided form for submitting demo AI usage requests and showing the result panel after submission.

### Request History

Table-first view for recent and historical requests with filters by decision, team, model, environment, and date.

## 6 Dashboard Design

The Dashboard should be the visual centerpiece of the hackathon demo. It should immediately communicate enterprise value: spend visibility, budget control, model optimization, anomaly detection, and chargeback ownership.

### Dashboard Header

At the top of the content area:

- Title: "AI Cost & Usage Governance"
- Subtitle: "Track tokens, optimize model spend, enforce budgets, and show cost ownership."
- Right side: date range selector and "Load Demo Data" action.

### Top KPI Cards

Place four KPI cards in one row across the top.

**Today's Spend**

- Shows current estimated AI spend for the selected day.
- Include small trend text such as "up 8% vs yesterday" or "within daily run rate".
- Icon: DollarSign.
- Use neutral text unless spend is abnormal.

**Budget Remaining**

- Shows remaining budget as currency and percentage.
- Include a compact progress indicator.
- Color turns warning near threshold and danger when exceeded.
- Icon: WalletCards or Gauge.

**Estimated Savings**

- Shows savings from model routing recommendations.
- Use success color.
- Include supporting text such as "from low-cost routing".
- Icon: TrendingDown.

**Active Alerts**

- Shows number of active cost or usage alerts.
- Use warning or danger depending on severity.
- Include count of high-severity alerts if present.
- Icon: Bell or TriangleAlert.

### Main Dashboard Grid

Use a 12-column desktop grid after the KPI cards.

**Row 1**

- Spend Trend Chart: left 8 columns.
- AI Recommendation Panel: right 4 columns.

**Row 2**

- Budget Utilization: left 4 columns.
- Team Spend: middle 4 columns.
- Model Usage: right 4 columns.

**Row 3**

- Recent Requests Table: left 8 columns.
- Active Alerts: right 4 columns.

**Row 4**

- Chargeback Summary: full width.

### Spend Trend Chart

Large chart card showing estimated AI spend and token volume over time.

Visual behavior:

- Primary line for spend.
- Secondary line or faint bars for token volume.
- Hover tooltip shows date, spend, tokens, and top team.
- Include a small legend with clear labels.

This should be the largest chart because it tells the spending story immediately.

### Budget Utilization

Compact section showing department or team budget usage.

Recommended layout:

- Horizontal progress bars for top departments or teams.
- Each row shows name, used amount, remaining amount, and percentage.
- Warning and danger colors appear only at thresholds.

### Team Spend

Bar chart showing estimated cost by team.

Recommended display:

- Sort descending by spend.
- Show top five teams.
- Include currency labels.
- Use primary color for normal spend and warning color for teams near budget limit.

### Model Usage

Donut chart or horizontal bar chart showing model usage distribution.

Recommended display:

- Show percentage of tokens or spend by model.
- Highlight expensive model usage.
- Include a small note when cheaper model routing created savings.

For enterprise readability, a horizontal bar chart is preferred if there are more than four models.

### AI Recommendation Panel

Right-side insight panel that makes the product feel intelligent.

Content examples:

- "Route low-risk summarization requests from GPT-4 class model to approved low-cost model."
- "Customer Analytics is forecast to exceed 92% of budget by month end."
- "Support Bot usage spiked 3.4x above baseline today."

Panel structure:

- Header with Sparkles or Bot icon.
- One primary recommendation.
- Two supporting facts.
- One action-style button label such as "Review request" or "View routing".

Keep this panel concise. It should feel like a smart assistant embedded in an enterprise console.

### Recent Requests Table

A dense table showing the latest AI usage requests.

Columns:

- Time
- Team
- App
- Requested Model
- Recommended Model
- Tokens
- Cost
- Decision

Rows should use status badges for decisions. The table should include five to seven rows on the dashboard.

### Active Alerts

Right-side list of active anomalies and budget warnings.

Each alert item should include:

- Severity icon
- Alert title
- Team or app
- Short description
- Timestamp

Examples:

- "Cost spike detected"
- "Budget threshold reached"
- "Expensive model used in dev"

### Chargeback Summary

Full-width section at the bottom of the dashboard.

Recommended layout:

- Table grouped by department or team.
- Columns: owner, tokens, estimated cost, budget used, top app, top model, alerts, savings.
- Include a small summary strip above the table with total chargeback amount and top cost owner.

This section should make transparent cost ownership obvious to judges.

## 7 Submit Request Page

The Submit Request page should feel like a polished enterprise workflow, but remain simple.

### Page Layout

Use a two-column layout on desktop:

- Left column: request form, approximately 60%.
- Right column: live scenario summary or result panel, approximately 40%.

Before submission, the right column shows "Scenario Preview". After submission, it becomes the Request Result panel.

### Demo Scenario Dropdown

Place the Demo Scenario dropdown at the top of the form. It should be visually prominent because it drives the hackathon demo.

Scenarios:

- Normal Request
- Budget Exceeded
- Model Routing
- Cost Spike
- Require Approval

When a scenario is selected, the form should auto-fill realistic values.

### Form Sections

**Request Context**

- Asset ID
- Owner
- Department
- Team
- Application
- Environment

**AI Usage**

- Requested action
- Prompt summary
- Requested model
- Input tokens
- Output tokens

**Governance Signals**

- Risk tier
- Data classification

### Form Behavior

- Keep labels clear and enterprise-friendly.
- Use select controls for department, team, app, environment, model, risk tier, and data classification.
- Use numeric inputs for token counts.
- Use a larger text area for prompt summary.
- Primary action: "Evaluate Request".
- Secondary action: "Reset".

The page should not require the user to understand backend concepts. It should feel like a FinOps analyst is evaluating an AI usage event.

## 8 Request Result

The Request Result panel appears after a request is submitted. It should be visually strong and easy to explain in a demo.

### Result Panel Structure

**Decision Header**

- Large decision badge.
- Short decision explanation headline.
- Request ID and timestamp as small metadata.

**Key Result Metrics**

Show compact metric rows:

- Estimated Cost
- Budget Status
- Recommended Model
- Savings
- Anomaly Status

**AI Recommendation**

Show one concise recommendation generated from the agent outputs.

Examples:

- "Use the approved low-cost model for this low-risk summarization request."
- "Block this request because the team has exceeded its monthly quota."
- "Require approval because spend is significantly above the normal baseline."

**Explanation**

Show a plain-language explanation with three short bullets:

- Budget policy result.
- Model routing result.
- Anomaly result.

### Visual Priorities

- Decision badge should be the most visible element.
- Cost and savings should be easy to read.
- Recommended model should be visually paired with requested model.
- Anomaly status should use clear severity color.

## 9 Charts

Use Recharts for all charts. Prefer clear enterprise charts over ornamental visuals.

**Today's Spend**

- Metric card with small sparkline.
- Recharts: LineChart.

**Budget Remaining**

- Progress bar style visualization.
- Recharts not required, but a RadialBarChart can be used if desired.
- For one-day MVP, use horizontal progress indicators.

**Estimated Savings**

- Metric card with mini trend.
- Recharts: AreaChart or LineChart.

**Active Alerts**

- Metric card with severity count.
- Recharts not required.

**Spend Trend Chart**

- Recharts: ComposedChart.
- Use line for spend and bars for token volume.

**Budget Utilization**

- Recharts: BarChart with horizontal layout.
- Alternative: simple progress rows for faster implementation.

**Team Spend**

- Recharts: BarChart.
- Sort by highest spend.

**Model Usage**

- Recharts: BarChart preferred.
- Recharts: PieChart acceptable for three or four models.

**Decision Breakdown**

- Recharts: Stacked BarChart or PieChart.
- Use status colors for Allow, Warn, Block, and Require Approval.

**Chargeback Summary**

- Table first.
- Recharts: BarChart for cost by department if time allows.

**Anomaly Severity**

- Recharts: BarChart or simple alert list.
- For the MVP, alert list is more useful than another chart.

## 10 Components

**Metric Card**

Displays one KPI, icon, primary value, trend text, and optional mini sparkline.

**Sidebar**

Contains product identity and the three navigation items.

**Header**

Displays page title, subtitle, date range selector, and demo data action.

**Status Badge**

Compact visual label for decisions, budgets, model approvals, and anomalies.

**Recommendation Card**

Displays the AI recommendation, reason, expected savings, and related request or team.

**Chart Card**

Reusable container for charts with title, subtitle, legend, and optional filter.

**Table**

Reusable table for recent requests, request history, alerts, and chargeback.

**Modal**

Used sparingly for request detail or alert detail. Avoid modal-heavy flows.

**Loading State**

Use skeleton rows and muted card placeholders. Avoid spinners as the primary loading experience.

**Empty State**

Use short, helpful messages with one clear action.

Examples:

- "No requests yet. Submit a demo request to generate a decision."
- "No active alerts for the selected date range."

Additional useful components:

- Demo Scenario Selector
- Date Range Selector
- Filter Bar
- Decision Result Panel
- Budget Progress Row
- Alert List Item
- Model Comparison Row
- Chargeback Summary Row

## 11 Icons

Use Lucide React icons for a consistent modern enterprise feel.

Recommended icons:

- Dashboard: LayoutDashboard
- Submit Request: Send
- Request History: History
- Spend: DollarSign
- Budget Remaining: WalletCards or Gauge
- Savings: TrendingDown
- Active Alerts: Bell or TriangleAlert
- Tokens: Coins or Hash
- Models: Cpu
- Model Routing: Route
- Teams: Users
- Applications: Boxes or AppWindow
- Chargeback: ReceiptText
- Recommendation: Sparkles or Bot
- Allow: CheckCircle2
- Warn: AlertTriangle
- Block: OctagonX or XCircle
- Require Approval: Clock3 or ShieldQuestion
- Info: Info
- Filters: SlidersHorizontal
- Date Range: CalendarDays
- Search: Search
- Download: Download
- Refresh: RefreshCw

Use icons inside buttons and badges where they improve scan speed. Avoid overusing icons in dense tables.

## 12 Status Badge Design

Status badges should be compact, high-contrast, and consistent across the app.

**Allow**

- Color: Success green.
- Icon: CheckCircle2.
- Meaning: Request is within policy and can proceed.
- Visual treatment: pale green background, green text, green icon.

**Warn**

- Color: Amber warning.
- Icon: AlertTriangle.
- Meaning: Request can proceed with caution, usually due to near-limit budget or routing recommendation.
- Visual treatment: pale amber background, amber text, amber icon.

**Block**

- Color: Danger red.
- Icon: OctagonX or XCircle.
- Meaning: Request should not proceed because budget, quota, model, or anomaly policy failed.
- Visual treatment: pale red background, red text, red icon.

**Require Approval**

- Color: Info blue or indigo.
- Icon: Clock3 or ShieldQuestion.
- Meaning: Request needs human review before proceeding.
- Visual treatment: pale blue background, blue text, blue icon.

Badge labels should be short:

- Allow
- Warn
- Block
- Approval

Use the full label "Require Approval" in the result panel where space is available.

## 13 Animations

Animations should be minimal and subtle.

Recommended transitions:

- Card hover lift of 1px or subtle border highlight.
- Smooth tab or page content fade.
- KPI number update with a gentle opacity transition.
- Result panel slides in lightly after submission.
- Table rows highlight briefly when new request appears.

Avoid:

- Flashy chart animations.
- Large motion effects.
- Confetti.
- Complex loading sequences.
- Custom animated backgrounds.

The product should feel stable, trustworthy, and enterprise-ready.

## 14 Demo Flow

The judge should see a premium dashboard immediately.

### Minute 0 to 1: Dashboard First Impression

Open the Dashboard. Show the four KPI cards:

- Today's Spend
- Budget Remaining
- Estimated Savings
- Active Alerts

Point out the Spend Trend Chart, AI Recommendation Panel, Team Spend, Model Usage, Active Alerts, and Chargeback Summary in one quick scan.

### Minute 1 to 2: Normal Request

Go to Submit Request. Select "Normal Request" from the Demo Scenario dropdown. The form auto-fills. Click "Evaluate Request".

Judges see:

- Decision: Allow
- Estimated cost
- Budget status healthy
- No anomaly
- Clear explanation

### Minute 2 to 3: Model Routing

Select "Model Routing". The form shows a low-risk task requesting an expensive model. Submit it.

Judges see:

- Recommended lower-cost model
- Estimated savings
- Warn or Allow decision
- AI Recommendation explaining the substitution

### Minute 3 to 4: Cost Spike or Budget Exceeded

Select "Cost Spike" or "Budget Exceeded". Submit it.

Judges see:

- Active anomaly or exceeded budget
- Warn, Block, or Require Approval decision
- Result panel explains why the request is risky from a cost perspective

### Minute 4 to 5: Return to Dashboard

Return to Dashboard. Show that the newly submitted requests changed:

- Spend trend
- Active alerts
- Recent requests
- Chargeback summary
- Estimated savings

Close with the business value: the platform makes AI spend visible, optimizes model selection, flags abnormal usage, and shows cost ownership.

## 15 UI Simplifications

This design is intentionally achievable for one developer in one day.

Simplifications:

- Only three pages: Dashboard, Submit Request, Request History.
- Budgets, model usage, alerts, recommendations, and chargeback live inside Dashboard.
- Use prefilled demo scenarios instead of complex data entry.
- Use simple filters only: date range, team, decision, and model.
- Use table rows and chart cards instead of complex drill-downs.
- Use static or mocked sample data where needed.
- Use simple progress bars for budget utilization.
- Use one result panel instead of a multi-step workflow.
- Avoid custom animations.
- Avoid drag-and-drop.
- Avoid advanced personalization.
- Avoid deep settings screens.
- Avoid separate admin pages.
- Avoid complex role management.

The design prioritizes presentation quality, clarity, and speed. The MVP should look like the first slice of a real enterprise product, not a complete enterprise platform.
