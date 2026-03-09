import { api } from "./api";
import type { LoginResponse } from "@/types";

const TOKEN_KEY = "token";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    let errorMessage = "Login failed";
    try {
      const body = await res.json();
      errorMessage = body.detail || body.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data: LoginResponse = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }
  return data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
