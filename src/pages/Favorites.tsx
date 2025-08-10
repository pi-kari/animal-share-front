import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ImageGrid } from "@/components/ImageGrid";
import { PostDetailModal } from "@/components/PostDetailModal";
import { apiRequest } from "@/lib/queryClient";
import type { PostWithTags } from "@/types";

export default function Favorites() {
  const [selectedPost, setSelectedPost] = useState<PostWithTags | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<PostWithTags[] | unknown>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      try {
        return await apiRequest<PostWithTags[]>("/api/user/favorites");
      } catch {
        return [];
      }
    },
    retry: 0,
    staleTime: 30_000,
  });

  const posts = useMemo<PostWithTags[]>(
    () => (Array.isArray(data) ? (data as PostWithTags[]) : []),
    [data]
  );

  return (
    <div className="min-h-screen bg-neutral-bg pb-28 md:pb-32">
      <Header onSearch={() => {}} onOpenUpload={() => setOpen(true)} />

      <main className="pt-16 mx-auto w-full max-w-5xl px-4 md:px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">お気に入り</h1>

        {isError ? (
          <div className="text-center text-sm text-red-500 py-16">
            お気に入りの取得に失敗しました。
          </div>
        ) : (
          <ImageGrid
            posts={posts}
            isLoading={isLoading}
            onPostClick={(p) => {
              setSelectedPost(p);
              setOpen(true);
            }}
            showEmptyState
          />
        )}

        <div className="h-24 md:h-28" />
      </main>

      <BottomNavigation onOpenUpload={() => setOpen(true)} />

      <PostDetailModal
        post={selectedPost}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
