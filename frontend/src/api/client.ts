import type {
  ApiEnvelope,
  DashboardData,
  DemoLoadData,
  HistoryData,
  ModelSummary,
  RequestDetailData,
  UsageRequestPayload,
  UsageRequestResult,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiClientError extends Error {
  code: string;
  details: Array<{ field: string; message: string }>;

  constructor(message: string, code = "UNEXPECTED_ERROR", details: Array<{ field: string; message: string }> = []) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch (error) {
    throw new ApiClientError("Backend API is not reachable. Start the FastAPI server and try again.", "NETWORK_ERROR");
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !envelope.success) {
    throw new ApiClientError(
      envelope.error?.message ?? "Request failed.",
      envelope.error?.code,
      envelope.error?.details ?? [],
    );
  }
  return envelope.data;
}

function queryString(params: Record<string, string | number | undefined | null>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export const api = {
  loadDemoData: (scenario = "default") =>
    request<DemoLoadData>("/demo/load", {
      method: "POST",
      body: JSON.stringify({ scenario, reset_existing: true }),
    }),

  getDashboard: (params: { from?: string; to?: string; team_id?: number } = {}) =>
    request<DashboardData>(`/dashboard${queryString(params)}`),

  getHistory: (
    params: {
      from?: string;
      to?: string;
      team_id?: number;
      decision_status?: string;
      model_id?: number;
      environment?: string;
      anomaly_severity?: string;
      limit?: number;
    } = {},
  ) => request<HistoryData>(`/history${queryString(params)}`),

  getRequestDetail: (id: number) => request<RequestDetailData>(`/request/${id}`),

  submitRequest: (payload: UsageRequestPayload) =>
    request<UsageRequestResult>("/request", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getModels: (params: { status?: string; provider?: string } = {}) =>
    request<{ items: ModelSummary[] }>(`/models${queryString(params)}`),
};
