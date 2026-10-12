// Centralized API Client for Practical 7: Authentication & Task Management
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Token & Session Storage Management
const TOKEN_KEY = "awdf_auth_token";
const USER_KEY = "awdf_auth_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Helper to execute HTTP requests with Bearer token and 401 handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...options.headers,
  };

  // Inject Bearer token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set JSON Content-Type when sending body
  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error(
      `Network Error: Unable to reach Express backend at ${API_BASE}. Ensure the backend server is running.`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Server Error (${response.status}): ${response.statusText}`);
    }
    data = null;
  }

  // Handle Token Expiration or Invalid Authentication (HTTP 401)
  if (response.status === 401) {
    clearAuth();
    window.dispatchEvent(
      new CustomEvent("auth-expired", {
        detail: {
          message:
            (data && data.message) || "Your session has expired. Please log in again.",
        },
      })
    );
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      `Request failed with HTTP status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==========================================
// Authentication API Endpoints
// ==========================================

export async function registerUser(email, password) {
  const res = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function loginUser(email, password) {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (res.token) {
    setToken(res.token);
  }
  if (res.user) {
    setUser(res.user);
  }
  return res;
}

export async function getMe() {
  const res = await request("/auth/me", {
    method: "GET",
  });
  if (res.user) {
    setUser(res.user);
  }
  return res.user;
}

export function logoutUser() {
  clearAuth();
  window.dispatchEvent(new Event("auth-logout"));
}

// ==========================================
// Protected Task API Endpoints
// ==========================================

export async function getTasks() {
  const res = await request("/tasks", {
    method: "GET",
  });
  return res.data || [];
}

export async function createTask(taskData) {
  const res = await request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  return res.data;
}

export async function updateTask(id, updateData) {
  const res = await request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
  return res.data;
}

export async function deleteTask(id) {
  const res = await request(`/tasks/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
