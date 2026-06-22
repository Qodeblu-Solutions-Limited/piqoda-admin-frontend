'use client'

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: "admin" | "user";
  adminType?: string;
  isActive?: boolean;
  createdAt?: number;
};

const AUTH_TOKEN_KEY = "piqoda_admin_token";
const AUTH_USER_KEY = "piqoda_admin_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    return apiUrl.replace(/\/api$/, "") + "/api";
  }

  if (typeof window === "undefined") {
    return "/api";
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    return siteUrl.replace(/\/api$/, "") + "/api";
  }

  return `${window.location.origin}/api`;
}

export function getStoredToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage failures
  }
}

export function clearAuth(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // ignore storage failures
  }
}

export async function signInAdmin(email: string, password: string) {
  const response = await fetch(`${getApiUrl()}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  let data: any = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(text || "Sign in failed: unexpected response type");
  }

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : data?.error || "Sign in failed";
    throw new Error(message);
  }

  setAuth(data.token, data.user);
  return data;
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}
