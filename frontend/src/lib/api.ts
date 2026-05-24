import { getCSRFToken } from "./csrf";
import type {
  LoginResponse,
  Submission,
  SubmissionCreate,
  SubmissionStatus,
  SubmissionUpdate,
  User,
} from "./types";

const BASE = "";
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers ?? {}) as Record<string, string>),
  };

  if (WRITE_METHODS.has(method)) {
    const token = getCSRFToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  return fetchAPI<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
}

export async function logout() {
  return fetchAPI("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function checkAuth() {
  return fetchAPI<User>("/api/auth/me", {
    credentials: "include",
  });
}

// Submissions (public — unauthenticated; CSRF-exempt server-side)
export async function submitFeedback(data: SubmissionCreate) {
  return fetchAPI<Submission>("/api/submissions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Submissions (admin)
export async function listSubmissions(status?: SubmissionStatus) {
  const query = status ? `?status=${status}` : "";
  return fetchAPI<Submission[]>(`/api/admin/submissions${query}`, {
    credentials: "include",
  });
}

export async function reviewSubmission(id: string, data: SubmissionUpdate) {
  return fetchAPI<Submission>(`/api/admin/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    credentials: "include",
  });
}
