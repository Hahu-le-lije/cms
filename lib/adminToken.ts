const TOKEN_KEY = "cms_admin_token";

export function getStoredAdminToken(): string {
  if (typeof window === "undefined") return "";

  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredAdminToken(token: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredAdminToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
}