import i18n from "./i18n";

// Normalize the API base URL: trim whitespace and remove trailing slashes
const API_BASE = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

const TOKEN_KEY = "honeychain_token";
const REFRESH_KEY = "honeychain_refresh";
const QUEUE_KEY = "honeychain_offline_queue";

/**
 * Build a full API URL from a path.
 * @param {string} path - API path starting with / (e.g., "/api/auth/login")
 * @returns {string} - Full URL (e.g., "https://api.example.com/api/auth/login" or "/api/auth/login")
 */
export function apiUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with /: ${path}`);
  }
  // If VITE_API_URL is empty, return same-origin path for proxy/full-stack deployments
  if (!API_BASE) {
    return path;
  }
  // Combine API base with path
  return `${API_BASE}${path}`;
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token) {
  if (token) {
    window.localStorage.setItem(REFRESH_KEY, token);
  }
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  // Clean up legacy keys from old implementations
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
}

export function storeAuthTokens(body) {
  if (body?.access_token) {
    setToken(body.access_token);
  }
  if (body?.refresh_token) {
    setRefreshToken(body.refresh_token);
  }
}

export function formatApiError(errorBody, status) {
  if (errorBody == null) {
    return i18n.t("apiErrors.genericError", { status });
  }
  const detail = errorBody.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item.msg}` : item.msg || JSON.stringify(item);
      })
      .join(" ");
  }
  return i18n.t("apiErrors.genericError", { status });
}

async function parseBody(response) {
  if (response.status === 204) {
    return null;
  }
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function readQueue() {
  try {
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(items) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function flushOfflineQueue() {
  const items = readQueue();
  if (!items.length) {
    return;
  }
  const leftover = [];
  for (const item of items) {
    try {
      await apiRequest(item.method, item.path, item.payload, { skipQueue: true });
    } catch {
      leftover.push(item);
    }
  }
  writeQueue(leftover);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushOfflineQueue();
  });
}

let refreshInFlight = null;

async function refreshAccess() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error(i18n.t("apiErrors.sessionExpired"));
  }
  if (!refreshInFlight) {
    refreshInFlight = fetch(apiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
      .then(async (response) => {
        const body = await parseBody(response);
        if (!response.ok) {
          throw new Error(formatApiError(body, response.status));
        }
        storeAuthTokens(body);
        return body;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function redirectExpired() {
  const path = window.location.pathname;
  if (path.startsWith("/login")) {
    return;
  }
  const next = encodeURIComponent(path + window.location.search);
  window.location.assign(`/login?expired=1&next=${next}`);
}

function isCredentialAuth(path) {
  return (
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/forgot-password") ||
    path.startsWith("/api/auth/reset-password") ||
    path.startsWith("/api/auth/logout")
  );
}

function isAnonymousApi(path) {
  return (
    path.startsWith("/api/public/") ||
    path.startsWith("/api/packages") ||
    path.startsWith("/api/verify/") ||
    path === "/health"
  );
}

export async function apiRequest(method, path, payload, options = {}) {
  const headers = {};
  const token = getToken();
  const skipAuth = options.anonymous || isAnonymousApi(path);
  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  let response;
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), options.timeoutMs || 12000);
    try {
      response = await fetch(apiUrl(path), {
        method,
        headers,
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timer);
    }
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(i18n.t("apiErrors.timeout"));
    }
    if (!options.skipQueue && method !== "GET") {
      const queue = readQueue();
      queue.push({ method, path, payload, queuedAt: new Date().toISOString() });
      writeQueue(queue);
      throw new Error(i18n.t("apiErrors.offline"));
    }
    throw new Error(i18n.t("apiErrors.networkError"));
  }
  if (response.status === 401 && !options.skipRefresh && !isCredentialAuth(path) && path !== "/api/auth/refresh") {
    try {
      await refreshAccess();
      return apiRequest(method, path, payload, { ...options, skipRefresh: true });
    } catch {
      clearToken();
      redirectExpired();
      throw new Error(i18n.t("apiErrors.sessionExpired"));
    }
  }
  const body = await parseBody(response);
  if (!response.ok) {
    throw new Error(formatApiError(body, response.status));
  }
  return body;
}

export function apiGet(path, options = {}) {
  return apiRequest("GET", path, undefined, options);
}

export function apiSend(method, path, payload) {
  return apiRequest(method, path, payload);
}

export function apiPost(path, payload) {
  return apiRequest("POST", path, payload);
}

export function qrImageUrl(packageId) {
  return apiUrl(`/api/packages/${packageId}/qr`);
}
