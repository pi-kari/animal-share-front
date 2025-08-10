// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type AuthUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
};

const MOCK_USER: AuthUser = {
  id: "preview-user",
  name: "プレビュー太郎",
  avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
};

export function useAuth(): AuthState {
  const preview = Boolean(import.meta.env.VITE_PREVIEW_AUTH);

  const [state, setState] = useState<AuthState>({
    isAuthenticated: preview ? true : false,
    isLoading: preview ? false : true,
    user: preview ? MOCK_USER : null,
  });

  useEffect(() => {
    if (preview) return; // プレビューモードは即終了

    let cancelled = false;
    (async () => {
      try {
        // サーバ側で現在のユーザーを返すAPIがある場合
        const me = await apiRequest<AuthUser>("/api/auth/user");
        if (!cancelled) {
          setState({
            isAuthenticated: Boolean(me),
            isLoading: false,
            user: me ?? null,
          });
        }
      } catch {
        if (!cancelled)
          setState({ isAuthenticated: false, isLoading: false, user: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preview]);

  return state;
}
