const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

type RequestOptions = RequestInit & {
  token?: string;
};

import { clearStoredAdminToken } from './adminToken';

async function request(
  endpoint: string,
  { token, headers, ...options }: RequestOptions = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: "application/json",

        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),

        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),

        ...(headers || {}),
      },

      cache: "no-store",
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch (_) {}

  if (!response.ok) {
    // If unauthorized, clear stored token so the UI can re-authenticate
    if (response.status === 401) {
      try {
        clearStoredAdminToken();
      } catch (_) {}
    }

    throw new Error(
      data?.message || "API request failed"
    );
  }

  return data;
}

/* =========================
   AUTH
========================= */

export const login = (
  email: string,
  password: string
) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

export const logout = (token: string) =>
  request("/api/auth/logout", {
    method: "POST",
    token,
  });

export const getCurrentUser = (token: string) =>
  request("/api/auth/user", {
    token,
  });

/* =========================
   CONTENT PACKS
========================= */

export const listContentPacks = (
  token: string
) =>
  request("/api/admin/content-packs", {
    token,
  });

export const getContentPack = (
  id: string,
  token: string
) =>
  request(`/api/admin/content-packs/${id}`, {
    token,
  });

export const createContentPack = (
  data: any,
  token: string
) =>
  request("/api/admin/content-packs", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateContentPack = (
  id: string,
  data: any,
  token: string
) =>
  request(`/api/admin/content-packs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });

export const deleteContentPack = (
  id: string,
  token: string
) =>
  request(`/api/admin/content-packs/${id}`, {
    method: "DELETE",
    token,
  });

/* =========================
   CONTENT PACK VERSIONS
========================= */

export const listVersions = (
  token: string,
  contentPackId?: number
) => {
  const query = contentPackId
    ? `?content_pack_id=${contentPackId}`
    : "";

  return request(
    `/api/admin/content-pack-versions${query}`,
    {
      token,
    }
  );
};

export const createVersion = (
  data: any,
  token: string
) =>
  request("/api/admin/content-pack-versions", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateVersion = (
  id: string,
  data: any,
  token: string
) =>
  request(
    `/api/admin/content-pack-versions/${id}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }
  );

export const deleteVersion = (
  id: string,
  token: string
) =>
  request(
    `/api/admin/content-pack-versions/${id}`,
    {
      method: "DELETE",
      token,
    }
  );

/* =========================
   PARENT / CHILD FEATURES
   ========================= */

export const getChildSubjects = (childId: string, token: string) =>
  request(`/api/subjects?child_id=${encodeURIComponent(childId)}`, {
    token,
  });

export const updateChildSubjects = (
  payload: { child_id: string; subjects: Array<{ game_type_id: number; status: boolean }> },
  token: string
) =>
  request(`/api/subjects`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

export const getRecommendations = (childId: string, token: string) =>
  request(`/api/children/${encodeURIComponent(childId)}/tasks/recommendations`, {
    token,
  });

export const assignTask = (childId: string, data: { content_id: number; game_type_id: number; reason?: string }, token: string) =>
  request(`/api/children/${encodeURIComponent(childId)}/tasks/assign`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

/* =========================
   ADMIN HELPERS
   ========================= */

export const listAdminChildren = (token: string) =>
  request(`/api/admin/children`, {
    token,
  });

export const getAssignedTasks = (childId: string, token: string) =>
  request(`/api/admin/children/${encodeURIComponent(childId)}/assigned-tasks`, {
    token,
  });
