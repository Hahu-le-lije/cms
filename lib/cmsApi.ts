const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

type RequestOptions = RequestInit & {
  token?: string;
};

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
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

export const logout = (token: string) =>
  request("/auth/logout", {
    method: "POST",
    token,
  });

export const getCurrentUser = (token: string) =>
  request("/auth/user", {
    token,
  });

/* =========================
   CONTENT PACKS
========================= */

export const listContentPacks = (
  token: string
) =>
  request("/admin/content-packs", {
    token,
  });

export const getContentPack = (
  id: string,
  token: string
) =>
  request(`/admin/content-packs/${id}`, {
    token,
  });

export const createContentPack = (
  data: any,
  token: string
) =>
  request("/admin/content-packs", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateContentPack = (
  id: string,
  data: any,
  token: string
) =>
  request(`/admin/content-packs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });

export const deleteContentPack = (
  id: string,
  token: string
) =>
  request(`/admin/content-packs/${id}`, {
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
    `/admin/content-pack-versions${query}`,
    {
      token,
    }
  );
};

export const createVersion = (
  data: any,
  token: string
) =>
  request("/admin/content-pack-versions", {
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
    `/admin/content-pack-versions/${id}`,
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
    `/admin/content-pack-versions/${id}`,
    {
      method: "DELETE",
      token,
    }
  );