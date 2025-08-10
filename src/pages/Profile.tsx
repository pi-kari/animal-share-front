// src/pages/Profile.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ImageGrid } from "@/components/ImageGrid";
import { PostDetailModal } from "@/components/PostDetailModal";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { PostWithTags } from "@/types";

export function Profile() {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState<PostWithTags | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  const userId = user?.id ?? "preview-user";

  // このユーザーの投稿だけ取得
  const { data, isLoading, isError } = useQuery<PostWithTags[] | unknown>({
    queryKey: ["/api/posts", { userId }],
    queryFn: async () => {
      try {
        return await apiRequest<PostWithTags[]>(`/api/posts?userId=${encodeURIComponent(userId)}`);
      } catch {
        return []; // 失敗してもUIは保つ
      }
    },
    staleTime: 30_000,
    retry: 0,
  });

  const posts = useMemo<PostWithTags[]>(
    () => (Array.isArray(data) ? (data as PostWithTags[]) : []),
    [data]
  );

  // 表示用のプロフィール情報（空でも落ちない）
  const displayName = user?.firstName || user?.name || user?.email || "ユーザー";
  const avatar = user?.profileImageUrl || user?.avatarUrl;

  return (
    <div className="min-h-screen bg-neutral-bg pb-28 md:pb-32">
      <Header onSearch={() => {}} onOpenUpload={() => {}} />

      <main className="pt-16 mx-auto w-full max-w-5xl px-4 md:px-6 py-6">
        {/* ヘッダーエリア */}
        <section className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden grid place-items-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">{displayName}</h1>
              <div className="mt-1 flex items-center gap-6 text-center">
                <div>
                  <div className="text-lg font-semibold">{posts.length}</div>
                  <div className="text-xs text-neutral-medium">投稿</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">0</div>
                  <div className="text-xs text-neutral-medium">フォロワー</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">0</div>
                  <div className="text-xs text-neutral-medium">フォロー中</div>
                </div>
              </div>
            </div>
          </div>

          {/* 設定/ログアウトなどの導線は必要に応じて */}
          <div className="text-sm text-neutral-medium space-x-4">
            <a href="/settings" className="hover:underline">設定</a>
            {/* <a href="/api/logout" className="hover:underline">ログアウト</a> */}
          </div>
        </section>

        {/* ▼ ここから “投稿だけ” を表示（お気に入りは廃止） */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-neutral-dark mb-3">投稿</h2>

          {isError ? (
            <div className="text-center text-sm text-red-500 py-16">
              投稿の取得に失敗しました。時間をおいて再度お試しください。
            </div>
          ) : (
            <ImageGrid
              posts={posts}
              isLoading={isLoading}
              onPostClick={(p) => { setSelectedPost(p); setIsPostDetailOpen(true); }}
              showEmptyState
            />
          )}
        </section>

        <div className="h-24 md:h-28" />
      </main>

      <BottomNavigation onOpenUpload={() => {}} />

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostDetailOpen}
        onClose={() => setIsPostDetailOpen(false)}
      />
    </div>
  );
}
