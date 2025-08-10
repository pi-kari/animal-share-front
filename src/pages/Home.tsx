import { useState } from "react";
import { Header } from "@/components/Header";
import { TagFilterBar } from "@/components/TagFilterBar";
import { ImageGrid } from "@/components/ImageGrid";
import { UploadModal } from "@/components/UploadModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { BottomNavigation } from "@/components/BottomNavigation";
import type { PostWithTags } from "@/types/api";
import { useSafePosts, useExcludedTags } from "@/hooks/api";

export function Home() {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostWithTags | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  // ゾーニング（除外タグ）を反映したい場合はコメントアウトを外す
  const { excludedIds } = useExcludedTags();

  // posts 取得（defaultQueryFn が queryKey から自動fetch）
  const { posts, isLoading } = useSafePosts({
    tagIds: selectedTagIds,
    excludeTagIds: excludedIds, // ← 除外タグを効かせる時にON
  });

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handlePostClick = (post: PostWithTags) => {
    setSelectedPost(post);
    setIsPostDetailOpen(true);
  };

  const handleSearch = (query: string) => {
    // TODO: 検索バーと連動するならここに処理
    console.log("Search query:", query);
  };

  return (
    <div className="min-h-screen bg-neutral-bg pb-28 md:pb-32">
      <Header
        onSearch={handleSearch}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      <main className="pt-16">
        <TagFilterBar
          selectedTagIds={selectedTagIds}
          onTagToggle={handleTagToggle}
        />

        <ImageGrid
          posts={posts}
          onPostClick={handlePostClick}
          isLoading={isLoading}
        />
      </main>

      <BottomNavigation onOpenUpload={() => setIsUploadModalOpen(true)} />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostDetailOpen}
        onClose={() => setIsPostDetailOpen(false)}
      />
    </div>
  );
}
