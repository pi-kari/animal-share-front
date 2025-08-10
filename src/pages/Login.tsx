// src/pages/Login.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const preview = Boolean(import.meta.env.VITE_PREVIEW_AUTH);

  // すでに認証済み、またはプレビューモードならホームへ
  useEffect(() => {
    if (preview) {
      setLocation("/");
      return;
    }
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [preview, isLoading, isAuthenticated, setLocation]);

  const handleLogin = () => {
    // プレビューモード時は擬似ログインとして遷移だけ
    if (preview) {
      setLocation("/");
      return;
    }
    // 本番：バックエンドのログインエンドポイントへ
    window.location.href = `${
      import.meta.env?.VITE_API_BASE_URL
    }/api/auth/google`;
  };

  // ローディング表示
  if (!preview && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-medium">読み込み中…</div>
      </div>
    );
  }

  // ログイン画面
  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-6 text-center">
        <div className="text-6xl mb-3">🐾</div>
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">
          AnimalShare へようこそ
        </h1>
        <p className="text-neutral-medium mb-6">
          かわいい動物写真を投稿・お気に入り登録・タグ検索できます。
        </p>
        <Button
          size="lg"
          className="w-full bg-primary text-white hover:bg-primary/90"
          onClick={handleLogin}
        >
          ログインして始める
        </Button>
        <p className="text-xs text-neutral-medium mt-4">
          プレビューモード中はボタンを押すとそのままホームに移動します。
        </p>
      </div>
    </div>
  );
}
