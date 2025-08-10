import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ImageGrid } from "@/components/ImageGrid";
import { PostDetailModal } from "@/components/PostDetailModal";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostWithTags, Tag, TagCategory } from "@/types";

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostWithTags | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  const { data: allTags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const { data: searchResults = [], isLoading } = useQuery<PostWithTags[]>({
    queryKey: ["/api/posts", { tagIds: selectedTagIds, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      selectedTagIds.forEach((id) => params.append("tagIds", id));

      const response = await fetch(
        `${import.meta.env?.VITE_API_BASE_URL}?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      return response.json();
    },
    enabled: selectedTagIds.length > 0,
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

  const clearAllTags = () => {
    setSelectedTagIds([]);
  };

  // Filter tags based on search query
  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered tags by category
  const tagsByCategory = {
    分類: filteredTags.filter((tag) => tag.category === "分類"),
    角度: filteredTags.filter((tag) => tag.category === "角度"),
    パーツ: filteredTags.filter((tag) => tag.category === "パーツ"),
    自由: filteredTags.filter((tag) => tag.category === "自由"),
  };

  return (
    <div className="min-h-screen bg-neutral-bg pb-20 lg:pb-0">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-dark mb-6">検索</h1>

            {/* Search Input */}
            <div className="mb-6">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                タグ名で検索
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="タグ名を入力してください..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Selected Tags */}
            {selectedTagIds.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">
                    選択中のタグ ({selectedTagIds.length})
                  </Label>
                  <Button variant="outline" size="sm" onClick={clearAllTags}>
                    すべて解除
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTagIds.map((tagId) => {
                    const tag = allTags.find((t) => t.id === tagId);
                    if (!tag) return null;

                    return (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        isSelected
                        onClick={() => handleTagToggle(tag.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tag Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Object.entries(tagsByCategory).map(([category, tags]) => (
                <Card key={category} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">
                      {category}タグ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tags.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          該当するタグがありません
                        </p>
                      ) : (
                        tags.map((tag) => (
                          <TagChip
                            key={tag.id}
                            tag={tag}
                            isSelected={selectedTagIds.includes(tag.id)}
                            onClick={() => handleTagToggle(tag.id)}
                            size="sm"
                          />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {selectedTagIds.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-neutral-dark mb-6">
                検索結果 {isLoading ? "" : `(${searchResults.length}件)`}
              </h2>
              <ImageGrid
                posts={searchResults}
                onPostClick={handlePostClick}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                タグを選択してください
              </h3>
              <p className="text-gray-500">
                検索したいタグを選択すると、該当する投稿が表示されます。
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostDetailOpen}
        onClose={() => setIsPostDetailOpen(false)}
      />
    </div>
  );
}
