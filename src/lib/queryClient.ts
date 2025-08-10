// src/lib/queryClient.ts
import { QueryClient, QueryFunctionContext } from "@tanstack/react-query";

/** APIのベースURL（環境変数は2種サポート） */
const RAW_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ||
  "/api";
const API_BASE = String(RAW_BASE).replace(/\/+$/, "");

/** 薄いフェッチラッパ（JSON/非JSON両対応、204対応、credentials同梱） */
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const isAbs = /^https?:\/\//i.test(path);
  const url = isAbs ? path : API_BASE + (path.startsWith("/") ? path : `/${path}`);

  const headers = new Headers(init.headers || {});
  let body = init.body;

  if (init.json !== undefined) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
    body,
  });

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    // エラーレスポンスはJSON優先で読む
    try {
      const err = ct.includes("application/json") ? await res.json() : await res.text();
      const msg =
        (typeof err === "object" && err && "message" in (err as any) && (err as any).message) ||
        (typeof err === "string" ? err : `${res.status} ${res.statusText}`);
      throw new Error(String(msg));
    } catch {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  // JSON以外も許容（必要時に拡張）
  return (await res.text()) as unknown as T;
}

/**
 * デフォルトqueryFn
 * - queryKey[0]: URL（必須）
 * - queryKey[1]: クエリオブジェクト（任意, {a:1, b:[2,3]} → ?a=1&b=2&b=3）
 */
export async function defaultQueryFn<T = unknown>({ queryKey }: QueryFunctionContext) {
  const [key0, params] = queryKey as [unknown, Record<string, unknown>?];
  if (typeof key0 !== "string") {
    throw new Error("defaultQueryFn expects queryKey[0] to be a string path");
  }

  let url = key0;
  if (params && typeof params === "object") {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
      else qs.set(k, String(v));
    }
    const q = qs.toString();
    if (q) url += (url.includes("?") ? "&" : "?") + q;
  }

  return await apiRequest<T>(url);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn, // ★ これが肝
      refetchOnWindowFocus: false,
      retry: 0,                // ← 開発中は0に（元は1）
      staleTime: 30_000,       // ← 追加：30秒は新鮮扱い
    },
  },
});
