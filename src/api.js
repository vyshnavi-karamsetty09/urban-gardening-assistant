const TOKEN_KEY = "gardenGuideAccessToken";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")).replace(/\/$/, "");

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const { timeoutMs = 30000, signal: externalSignal, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has("Content-Type") && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers, signal: controller.signal });
  } catch (error) {
    const timedOut = controller.signal.aborted && !externalSignal?.aborted;
    const networkError = new Error(
      timedOut
        ? "Garden Guide took too long to respond. Please try again."
        : "Unable to reach Garden Guide right now.",
    );
    networkError.status = 0;
    networkError.cause = error;
    networkError.timedOut = timedOut;
    throw networkError;
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.message
      ? payload.message
      : "Something went wrong. Please try again.";
    const error = new Error(message);
    error.status = response.status;
    error.data = payload;

    if (response.status === 401) {
      window.dispatchEvent(new Event("garden-guide:unauthorized"));
    }

    throw error;
  }

  return payload;
}

export const authApi = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  demoAccount: (data = {}) => apiRequest("/auth/demo-account", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiRequest("/auth/me", { cache: "no-store" }),
  updateProfile: (data) => apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
};

export const environmentApi = {
  get: () => apiRequest("/environment"),
  save: (data) => apiRequest("/environment", { method: "PUT", body: JSON.stringify(data) }),
};

export const gardenApi = {
  list: () => apiRequest("/garden"),
  add: (plant) => apiRequest("/garden", { method: "POST", body: JSON.stringify(plant) }),
  update: (id, plant) => apiRequest(`/garden/${id}`, { method: "PUT", body: JSON.stringify(plant) }),
  remove: (id) => apiRequest(`/garden/${id}`, { method: "DELETE" }),
  clear: () => apiRequest("/garden", { method: "DELETE" }),
};

export const taskApi = {
  list: () => apiRequest("/tasks"),
  add: (task) => apiRequest("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, task) => apiRequest(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) }),
  remove: (id) => apiRequest(`/tasks/${id}`, { method: "DELETE" }),
  clear: () => apiRequest("/tasks", { method: "DELETE" }),
};

export const plantApi = {
  list: () => apiRequest("/plants"),
};

export const recommendationApi = {
  analyzeLocation: (pincode) => apiRequest("/recommendations/analyze-location", {
    method: "POST",
    body: JSON.stringify({ pincode }),
  }),
  recommend: (environment) => apiRequest("/recommendations", {
    method: "POST",
    body: JSON.stringify(environment),
  }),
};

export const diseaseApi = {
  analyze: (data) => apiRequest("/disease/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  history: () => apiRequest("/disease/history"),
};

export const assistantApi = {
  chat: (message, context = {}) => apiRequest("/assistant/chat", {
    method: "POST",
    timeoutMs: 15000,
    body: JSON.stringify({ message, context }),
  }),
};

export const communityApi = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
    const query = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/community${query ? `?${query}` : ""}`);
  },
  create: (data) => apiRequest("/community", { method: "POST", body: JSON.stringify(data) }),
  like: (id, userEmail) => apiRequest(`/community/${id}/like`, { method: "POST", body: JSON.stringify({ userEmail }) }),
  comment: (id, data) => apiRequest(`/community/${id}/comments`, { method: "POST", body: JSON.stringify(data) }),
};

export const adminApi = {
  users: () => apiRequest("/admin/users"),
  reports: () => apiRequest("/admin/reports"),
  plants: () => apiRequest("/admin/plants"),
  createPlant: (plant) => apiRequest("/admin/plants", { method: "POST", body: JSON.stringify(plant) }),
  updatePlant: (id, plant) => apiRequest(`/admin/plants/${id}`, { method: "PUT", body: JSON.stringify(plant) }),
  deletePlant: (id) => apiRequest(`/admin/plants/${id}`, { method: "DELETE" }),
};
