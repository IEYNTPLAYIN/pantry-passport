import type { ApiErrorResponse } from "@/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: ApiErrorResponse | null = null;

    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = null;
    }

    throw new ApiClientError(
      payload?.error.message ?? "The request failed.",
      payload?.error.code ?? "REQUEST_FAILED",
    );
  }

  return (await response.json()) as T;
}
