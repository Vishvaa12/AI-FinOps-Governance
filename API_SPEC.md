# AI-08 AI FinOps Governance REST API Specification

## 1 API Design Principles

The API should be small, predictable, and easy to implement in one day with Python FastAPI. It supports the polished hackathon UI without introducing enterprise API complexity.

API philosophy:

- Use REST-style resource names and HTTP methods.
- Use JSON for every request and response.
- Keep endpoint count minimal.
- Optimize for the three-page UI: Dashboard, Submit Request, and Request History.
- Return frontend-ready data where it keeps implementation simple.
- Use one standard response envelope for success and errors.
- Use deterministic business decision responses: `allow`, `warn`, `block`, and `require_approval`.
- Keep validation rules explicit and easy to demo.
- Avoid pagination complexity unless the dataset grows beyond demo size.
- Avoid authentication, tenant management, and role management for the hackathon.

The API should feel clean enough to evolve later, but simple enough that one developer can build it quickly.

Base path:

`/api`

Content type:

`application/json`

## 2 Authentication

For the hackathon MVP:

- No login.
- No JWT.
- No OAuth.
- No user management.
- Assume a single demo user.
- Assume the demo user represents a FinOps analyst.

The frontend can display a static user label such as `FinOps Analyst`, but the backend does not need to authenticate or authorize requests.

## 3 API Endpoints

Only six endpoints are required for the MVP.

## 1. POST /api/demo/load

### Purpose

Loads or resets predictable demo data for teams, budgets, models, usage events, and governance decisions. This supports a reliable judge demo.

The endpoint should be safe to call multiple times. For the hackathon, it can reset existing demo records and reload known sample data.

### Request

Fields:

- `scenario`: optional string. Loads a specific demo set or the default set.
- `reset_existing`: optional boolean. Indicates whether existing demo data should be cleared first.

Recommended scenario values:

- `default`
- `normal_request`
- `budget_warning`
- `model_routing`
- `cost_spike`
- `require_approval`

Example request shape:

```json
{
  "scenario": "default",
  "reset_existing": true
}
```

### Response

Returns counts and enough reference data for the frontend to immediately populate dashboard filters and request dropdowns.

Response data:

- `scenario`
- `loaded_at`
- `counts`
- `teams`
- `models`
- `message`

Example response shape:

```json
{
  "success": true,
  "data": {
    "scenario": "default",
    "loaded_at": "2026-07-20T10:00:00Z",
    "counts": {
      "teams": 4,
      "budgets": 4,
      "models": 4,
      "usage_events": 24,
      "governance_decisions": 24
    },
    "teams": [],
    "models": [],
    "message": "Demo data loaded successfully."
  },
  "error": null,
  "meta": {
    "request_id": "api-001"
  }
}
```

### Possible Errors

- `VALIDATION_ERROR`: Invalid scenario name.
- `DEMO_LOAD_FAILED`: Demo data could not be loaded.
- `UNEXPECTED_ERROR`: Unexpected server failure.

-----------------------------------

## 2. POST /api/request

### Purpose

Submits an AI usage request for governance evaluation. This is the main API for the Submit Request page.

The backend runs the in-process agent flow:

1. Usage Collector Agent
2. Budget Policy Agent
3. Model Router Agent
4. Anomaly Detection Agent
5. Chargeback Agent summary refresh or calculation

The API returns the final decision and all data needed for the Request Result panel.

### Request Body

Fields:

- `team_id`: required integer.
- `application_name`: required string.
- `environment`: required enum string.
- `asset_id`: optional string.
- `owner`: optional string.
- `requested_action`: required string.
- `prompt_summary`: optional string.
- `requested_model_id`: required integer.
- `input_tokens`: required integer.
- `output_tokens`: required integer.
- `risk_tier`: required enum string.
- `data_classification`: required enum string.

Example request shape:

```json
{
  "team_id": 1,
  "application_name": "Customer Insight Assistant",
  "environment": "production",
  "asset_id": "APP-CIA-001",
  "owner": "Priya Menon",
  "requested_action": "Summarize customer meeting notes",
  "prompt_summary": "Summarize recent sales call notes into follow-up actions.",
  "requested_model_id": 2,
  "input_tokens": 4200,
  "output_tokens": 900,
  "risk_tier": "low",
  "data_classification": "internal"
}
```

### Validation Rules

- `team_id` must reference an active team.
- `application_name` is required and must not be blank.
- `environment` must be one of `development`, `test`, `staging`, or `production`.
- `requested_action` is required and must not be blank.
- `requested_model_id` must reference an existing model.
- `input_tokens` must be greater than or equal to 0.
- `output_tokens` must be greater than or equal to 0.
- Total tokens must be greater than 0.
- `risk_tier` must be one of `low`, `medium`, or `high`.
- `data_classification` must be one of `public`, `internal`, `confidential`, or `restricted`.
- `prompt_summary`, if provided, should be short enough for dashboard display.
- `asset_id`, if provided, should be short enough for table display.

### Response

Response data:

- `usage_event`
- `decision`
- `agent_summary`

Example response shape:

```json
{
  "success": true,
  "data": {
    "usage_event": {
      "id": 101,
      "request_id": "REQ-20260720-0101",
      "team": {
        "id": 1,
        "name": "Customer Analytics",
        "department": "Sales Operations"
      },
      "application_name": "Customer Insight Assistant",
      "environment": "production",
      "requested_model": {
        "id": 2,
        "provider": "Mock",
        "model_name": "Standard Balanced Model"
      },
      "recommended_model": {
        "id": 3,
        "provider": "Mock",
        "model_name": "Low Cost Fast Model"
      },
      "input_tokens": 4200,
      "output_tokens": 900,
      "total_tokens": 5100,
      "estimated_cost": 0.42,
      "submitted_at": "2026-07-20T10:05:00Z"
    },
    "decision": {
      "status": "warn",
      "label": "Warn",
      "budget_status": "within_budget",
      "model_status": "rerouted",
      "anomaly_severity": "none",
      "anomaly_reason": null,
      "estimated_savings": 0.18,
      "recommended_model_name": "Low Cost Fast Model",
      "recommendation": "Use the approved low-cost model for this low-risk summarization request.",
      "explanation": "The request is within budget, but a lower-cost approved model is suitable for the selected risk tier."
    },
    "agent_summary": {
      "usage_collector": "Captured 5,100 tokens and estimated cost.",
      "budget_policy": "Team remains within monthly budget.",
      "model_router": "Lower-cost model recommended.",
      "anomaly_detection": "No abnormal usage detected.",
      "chargeback": "Cost attributed to Customer Analytics."
    }
  },
  "error": null,
  "meta": {
    "request_id": "api-002"
  }
}
```

### Decision Object

The `decision` object should be consistent everywhere it appears.

Fields:

- `status`: enum value: `allow`, `warn`, `block`, or `require_approval`.
- `label`: UI-friendly label: `Allow`, `Warn`, `Block`, or `Require Approval`.
- `budget_status`: enum value: `within_budget`, `near_limit`, `exceeded`, or `no_budget`.
- `model_status`: enum value: `approved`, `rerouted`, `restricted`, or `blocked`.
- `anomaly_severity`: enum value: `none`, `low`, `medium`, or `high`.
- `anomaly_reason`: nullable string.
- `estimated_savings`: number.
- `recommended_model_name`: nullable string.
- `recommendation`: short business recommendation.
- `explanation`: plain-language explanation.

### Possible Errors

- `VALIDATION_ERROR`: Request fields are missing or invalid.
- `TEAM_NOT_FOUND`: Team does not exist or is inactive.
- `MODEL_NOT_FOUND`: Requested model does not exist.
- `MODEL_UNAVAILABLE`: Requested model is inactive or blocked.
- `BUDGET_NOT_FOUND`: No budget is configured for the team.
- `REQUEST_EVALUATION_FAILED`: Agent workflow could not produce a decision.
- `UNEXPECTED_ERROR`: Unexpected server failure.

-----------------------------------

## 3. GET /api/dashboard

### Purpose

Returns all data needed to render the Dashboard page in one call.

This endpoint intentionally provides frontend-ready aggregates to keep the hackathon UI simple and fast.

Optional query parameters:

- `from`: start date in `YYYY-MM-DD` format.
- `to`: end date in `YYYY-MM-DD` format.
- `team_id`: optional team filter.

### Response Structure

Response data:

- `kpis`
- `spend_trend`
- `budget_utilization`
- `team_spend`
- `model_usage`
- `ai_recommendation`
- `recent_requests`
- `active_alerts`
- `chargeback_summary`
- `reference_data`

Example response shape:

```json
{
  "success": true,
  "data": {
    "kpis": {
      "todays_spend": 128.45,
      "budget_remaining": 7420.00,
      "budget_remaining_percent": 63,
      "estimated_savings": 386.20,
      "active_alerts": 3
    },
    "spend_trend": [],
    "budget_utilization": [],
    "team_spend": [],
    "model_usage": [],
    "ai_recommendation": {
      "title": "Route low-risk summarization to the low-cost model",
      "impact": "Estimated monthly savings of $386.20",
      "severity": "info",
      "related_team": "Support Automation"
    },
    "recent_requests": [],
    "active_alerts": [],
    "chargeback_summary": [],
    "reference_data": {
      "teams": [],
      "models": []
    }
  },
  "error": null,
  "meta": {
    "request_id": "api-003",
    "date_range": {
      "from": "2026-07-01",
      "to": "2026-07-20"
    }
  }
}
```

Recommended dashboard object details:

**kpis**

- `todays_spend`
- `budget_remaining`
- `budget_remaining_percent`
- `estimated_savings`
- `active_alerts`

**spend_trend**

- `date`
- `estimated_cost`
- `total_tokens`

**budget_utilization**

- `team_id`
- `team_name`
- `department`
- `budget_amount`
- `used_amount`
- `remaining_amount`
- `used_percent`
- `budget_status`

**team_spend**

- `team_id`
- `team_name`
- `department`
- `estimated_cost`
- `total_tokens`

**model_usage**

- `model_id`
- `model_name`
- `provider`
- `estimated_cost`
- `total_tokens`
- `usage_percent`

**ai_recommendation**

- `title`
- `impact`
- `severity`
- `related_team`
- `related_model`

**recent_requests**

- Recent request rows matching the Request History summary format.

**active_alerts**

- Derived from governance decisions where anomaly severity is not `none`, budget status is `near_limit` or `exceeded`, or model status is `restricted` or `blocked`.

**chargeback_summary**

- Grouped cost ownership by team and department.

**reference_data**

- Active teams and model summary values needed by the frontend dropdowns.

-----------------------------------

## 4. GET /api/history

### Purpose

Returns request history for the Request History page and dashboard recent request table.

### Filters

Optional query parameters:

- `from`: start date in `YYYY-MM-DD` format.
- `to`: end date in `YYYY-MM-DD` format.
- `team_id`: team identifier.
- `decision_status`: `allow`, `warn`, `block`, or `require_approval`.
- `model_id`: requested model identifier.
- `environment`: `development`, `test`, `staging`, or `production`.
- `anomaly_severity`: `none`, `low`, `medium`, or `high`.
- `limit`: maximum number of rows.

For the MVP:

- Default `limit` should be 25.
- Maximum `limit` should be 100.
- Offset pagination is optional and not required for the demo.

### Response

Response data:

- `items`
- `summary`

Each item:

- `id`
- `request_id`
- `submitted_at`
- `team_name`
- `department`
- `application_name`
- `environment`
- `requested_model_name`
- `recommended_model_name`
- `total_tokens`
- `estimated_cost`
- `decision_status`
- `budget_status`
- `model_status`
- `anomaly_severity`

Example response shape:

```json
{
  "success": true,
  "data": {
    "items": [],
    "summary": {
      "total_requests": 25,
      "total_tokens": 184500,
      "total_estimated_cost": 312.75,
      "allow_count": 16,
      "warn_count": 6,
      "block_count": 2,
      "require_approval_count": 1
    }
  },
  "error": null,
  "meta": {
    "request_id": "api-004",
    "limit": 25
  }
}
```

-----------------------------------

## 5. GET /api/request/{id}

### Purpose

Returns full detail for a single submitted AI usage request. This supports clicking a row in Recent Requests or Request History.

Path parameter:

- `id`: numeric usage event identifier.

### Response

Response data:

- `usage_event`
- `decision`
- `team`
- `requested_model`
- `recommended_model`
- `cost_breakdown`
- `agent_summary`

Example response shape:

```json
{
  "success": true,
  "data": {
    "usage_event": {
      "id": 101,
      "request_id": "REQ-20260720-0101",
      "application_name": "Customer Insight Assistant",
      "environment": "production",
      "asset_id": "APP-CIA-001",
      "owner": "Priya Menon",
      "requested_action": "Summarize customer meeting notes",
      "prompt_summary": "Summarize recent sales call notes into follow-up actions.",
      "risk_tier": "low",
      "data_classification": "internal",
      "input_tokens": 4200,
      "output_tokens": 900,
      "total_tokens": 5100,
      "estimated_cost": 0.42,
      "submitted_at": "2026-07-20T10:05:00Z"
    },
    "team": {
      "id": 1,
      "name": "Customer Analytics",
      "department": "Sales Operations",
      "owner_name": "Priya Menon"
    },
    "requested_model": {
      "id": 2,
      "provider": "Mock",
      "model_name": "Standard Balanced Model"
    },
    "recommended_model": {
      "id": 3,
      "provider": "Mock",
      "model_name": "Low Cost Fast Model"
    },
    "decision": {
      "status": "warn",
      "label": "Warn",
      "budget_status": "within_budget",
      "model_status": "rerouted",
      "anomaly_severity": "none",
      "anomaly_reason": null,
      "estimated_savings": 0.18,
      "recommended_model_name": "Low Cost Fast Model",
      "recommendation": "Use the approved low-cost model for this low-risk summarization request.",
      "explanation": "The request is within budget, but a lower-cost approved model is suitable for the selected risk tier."
    },
    "cost_breakdown": {
      "input_cost": 0.25,
      "output_cost": 0.17,
      "total_cost": 0.42,
      "estimated_savings": 0.18
    },
    "agent_summary": {
      "usage_collector": "Captured 5,100 tokens and estimated cost.",
      "budget_policy": "Team remains within monthly budget.",
      "model_router": "Lower-cost model recommended.",
      "anomaly_detection": "No abnormal usage detected.",
      "chargeback": "Cost attributed to Customer Analytics."
    }
  },
  "error": null,
  "meta": {
    "request_id": "api-005"
  }
}
```

Possible errors:

- `REQUEST_NOT_FOUND`: No request exists for the provided ID.
- `VALIDATION_ERROR`: ID is invalid.
- `UNEXPECTED_ERROR`: Unexpected server failure.

-----------------------------------

## 6. GET /api/models

### Purpose

Returns the model catalog for request forms, model usage display, and model routing explanations.

Optional query parameters:

- `status`: `approved`, `restricted`, `blocked`, or `inactive`.
- `provider`: provider name.

### Response

Response data:

- `items`

Each item:

- `id`
- `provider`
- `model_name`
- `status`
- `input_token_cost`
- `output_token_cost`
- `risk_suitability`
- `monthly_token_cap`
- `routing_priority`
- `display_label`

Example response shape:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "provider": "Mock",
        "model_name": "Premium Reasoning Model",
        "status": "restricted",
        "input_token_cost": 0.00008,
        "output_token_cost": 0.00012,
        "risk_suitability": "all",
        "monthly_token_cap": 500000,
        "routing_priority": 30,
        "display_label": "Mock - Premium Reasoning Model"
      }
    ]
  },
  "error": null,
  "meta": {
    "request_id": "api-006"
  }
}
```

Possible errors:

- `VALIDATION_ERROR`: Invalid query parameter.
- `UNEXPECTED_ERROR`: Unexpected server failure.

## 4 Standard Response Format

Use one response envelope for every endpoint.

### Success

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "api-generated-id"
  }
}
```

### Validation Error

Used when the request shape or field value is invalid.

Recommended HTTP status:

- `400 Bad Request`

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "input_tokens",
        "message": "Input tokens must be greater than or equal to 0."
      }
    ]
  },
  "meta": {
    "request_id": "api-generated-id"
  }
}
```

### Business Rule Error

Used when the request is valid JSON but cannot be processed because of a known business condition.

Recommended HTTP status:

- `404 Not Found` for missing records.
- `409 Conflict` for unavailable or invalid business state.

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "TEAM_NOT_FOUND",
    "message": "The selected team does not exist or is inactive.",
    "details": []
  },
  "meta": {
    "request_id": "api-generated-id"
  }
}
```

### Unexpected Error

Used for unhandled failures.

Recommended HTTP status:

- `500 Internal Server Error`

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNEXPECTED_ERROR",
    "message": "An unexpected error occurred.",
    "details": []
  },
  "meta": {
    "request_id": "api-generated-id"
  }
}
```

## 5 Validation Rules

### Common Rules

- Request body must be valid JSON when a body is required.
- Unknown fields may be ignored for the MVP, but should not be required.
- Date filters must use `YYYY-MM-DD`.
- Numeric IDs must be positive integers.
- Enum values must use lowercase API values.
- String fields should be trimmed before validation.

### POST /api/demo/load

- `scenario` is optional.
- If provided, `scenario` must be one of the supported demo scenario values.
- `reset_existing` is optional and defaults to `true`.

### POST /api/request

- `team_id` is required.
- `team_id` must reference an active team.
- `application_name` is required.
- `application_name` must not be blank.
- `environment` is required.
- `environment` must be `development`, `test`, `staging`, or `production`.
- `requested_action` is required.
- `requested_action` must not be blank.
- `requested_model_id` is required.
- `requested_model_id` must reference an existing model.
- `input_tokens` is required.
- `input_tokens` must be greater than or equal to 0.
- `output_tokens` is required.
- `output_tokens` must be greater than or equal to 0.
- `input_tokens + output_tokens` must be greater than 0.
- `risk_tier` is required.
- `risk_tier` must be `low`, `medium`, or `high`.
- `data_classification` is required.
- `data_classification` must be `public`, `internal`, `confidential`, or `restricted`.
- `prompt_summary` should not store a full prompt; keep it short and presentation-friendly.

### GET /api/dashboard

- `from`, if provided, must use `YYYY-MM-DD`.
- `to`, if provided, must use `YYYY-MM-DD`.
- `from` must be before or equal to `to`.
- `team_id`, if provided, must be a positive integer.

### GET /api/history

- `from`, if provided, must use `YYYY-MM-DD`.
- `to`, if provided, must use `YYYY-MM-DD`.
- `from` must be before or equal to `to`.
- `team_id`, if provided, must be a positive integer.
- `model_id`, if provided, must be a positive integer.
- `decision_status`, if provided, must be valid.
- `environment`, if provided, must be valid.
- `anomaly_severity`, if provided, must be valid.
- `limit`, if provided, must be between 1 and 100.

### GET /api/request/{id}

- `id` must be a positive integer.

### GET /api/models

- `status`, if provided, must be `approved`, `restricted`, `blocked`, or `inactive`.
- `provider`, if provided, must not be blank.

## 6 Error Codes

Use a compact error code list.

| Error Code | Meaning | Typical HTTP Status |
|---|---|---:|
| `VALIDATION_ERROR` | Request body, path parameter, or query parameter is invalid. | 400 |
| `DEMO_LOAD_FAILED` | Demo data could not be loaded. | 500 |
| `TEAM_NOT_FOUND` | Team does not exist or is inactive. | 404 |
| `MODEL_NOT_FOUND` | Model does not exist. | 404 |
| `MODEL_UNAVAILABLE` | Model exists but is inactive or blocked for direct use. | 409 |
| `BUDGET_NOT_FOUND` | No active budget exists for the team and current period. | 409 |
| `REQUEST_NOT_FOUND` | Requested usage event does not exist. | 404 |
| `REQUEST_EVALUATION_FAILED` | The agent workflow could not produce a decision. | 500 |
| `UNEXPECTED_ERROR` | Unhandled server failure. | 500 |

For the hackathon, keep error messages plain and helpful rather than overly technical.

## 7 API Flow

### Initial Dashboard Load

1. Frontend calls `POST /api/demo/load` when the user clicks "Load Demo Data" or when the app starts in demo mode.
2. Frontend calls `GET /api/dashboard`.
3. Dashboard renders KPI cards, spend trend, budget utilization, team spend, model usage, recommendation panel, recent requests, active alerts, and chargeback summary.
4. Frontend calls `GET /api/models` if model dropdown options need to be refreshed independently.

### Submit Request Flow

1. User opens Submit Request page.
2. Frontend uses teams from `GET /api/dashboard` reference data and models from `GET /api/models`.
3. User selects a demo scenario.
4. Frontend auto-fills the form.
5. Frontend sends `POST /api/request`.
6. Backend evaluates the request and returns a decision.
7. Frontend displays the Request Result panel.
8. Frontend refreshes `GET /api/dashboard` so KPI cards, charts, recent requests, alerts, and chargeback summary reflect the new request.

### Request History Flow

1. User opens Request History.
2. Frontend calls `GET /api/history`.
3. User applies simple filters.
4. Frontend calls `GET /api/history` with query parameters.
5. User clicks a request row.
6. Frontend calls `GET /api/request/{id}` and displays request detail.

## 8 Demo Scenario API Usage

### Normal Request

1. `POST /api/demo/load`
2. `GET /api/dashboard`
3. `GET /api/models`
4. `POST /api/request` with a healthy team, approved model, normal token count, and low or medium risk.
5. Expected decision: `allow`.
6. `GET /api/dashboard` to show updated recent requests and spend.

### Budget Warning

1. `POST /api/demo/load` with default or budget-focused scenario.
2. `GET /api/dashboard`
3. `POST /api/request` with a team near its monthly threshold.
4. Expected decision: `warn`.
5. `GET /api/dashboard` to show budget utilization and active alert update.

### Model Routing

1. `POST /api/demo/load` with default or model routing scenario.
2. `GET /api/models`
3. `POST /api/request` with a low-risk request using a high-cost model.
4. Expected decision: `warn` or `allow`.
5. Expected model status: `rerouted`.
6. Expected result: recommended lower-cost model and estimated savings.
7. `GET /api/dashboard` to show estimated savings update.

### Cost Spike

1. `POST /api/demo/load` with default or cost spike scenario.
2. `GET /api/dashboard`
3. `POST /api/request` with unusually high token count.
4. Expected decision: `warn` or `require_approval`.
5. Expected anomaly severity: `medium` or `high`.
6. `GET /api/dashboard` to show active alerts and spend trend update.

### Require Approval

1. `POST /api/demo/load` with default or require approval scenario.
2. `GET /api/models`
3. `POST /api/request` with high risk tier, restricted data classification, production environment, or high cost impact.
4. Expected decision: `require_approval`.
5. `GET /api/request/{id}` if the judge wants to inspect the full explanation.
6. `GET /api/dashboard` to show the request in Recent Requests.

## 9 Hackathon Simplifications

The API intentionally avoids enterprise complexity.

Simplifications:

- No authentication.
- No authorization.
- No user profile endpoint.
- No tenant endpoint.
- No separate teams endpoint.
- No separate budget management endpoints.
- No model update endpoints.
- No approval workflow endpoints.
- No export endpoint.
- No async job polling.
- No event streaming.
- No webhooks.
- No pagination beyond a simple `limit`.
- No API versioning beyond the `/api` base path.
- No separate anomaly endpoint.
- No separate chargeback endpoint.
- Dashboard returns aggregated frontend-ready data in one call.
- Request evaluation is synchronous so the demo result appears immediately.
- Demo data loading is a first-class endpoint so judges see reliable scenarios.

These choices keep the API small while fully supporting the AI-08 hackathon story: track usage, calculate token cost, enforce budget policy, recommend lower-cost models, flag anomalies, and show chargeback ownership.
