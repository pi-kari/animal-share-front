import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { TagChip } from "./TagChip";
import { Button } from "@/components/ui/button";
import { Tag } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useSafeTags } from "@/hooks/api";

interface TagFilterBarProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  onAdvancedSearch?: () => void;
}

// 念のためどんな形が来ても配列化する
function toTagArray(x: unknown): Tag[] {
  if (Array.isArray(x)) return x as Tag[];
  if (x && typeof x === "object") {
    const obj = x as any;
    if (Array.isArray(obj.data)) return obj.data as Tag[];
    if (Array.isArray(obj.tags)) return obj.tags as Tag[];
  }
  return [];
}

export function TagFilterBar({ selectedTagIds, onTagToggle, onAdvancedSearch }: TagFilterBarProps) {
  const [showAll, setShowAll] = useState(false);

  const { data } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: () => apiRequest<Tag[]>('/api/tags'), // ← fetcher明示
    staleTime: 30_000,
  });

  const allTags = toTagArray(data);

  // Group tags by category for better organization
  const tagsByCategory = {
    '分類': allTags.filter(tag => tag.category === '分類'),
    '角度': allTags.filter(tag => tag.category === '角度'),
    'パーツ': allTags.filter(tag => tag.category === 'パーツ'),
    '自由': allTags.filter(tag => tag.category === '自由'),
  };

  // Show commonly used tags first, then others
  const commonTags = [
    ...tagsByCategory['分類'].slice(0, 5),
    ...tagsByCategory['角度'].slice(0, 2),
    ...tagsByCategory['パーツ'].slice(0, 2),
  ];

  const displayTags = showAll ? allTags : commonTags;

  return (
    <div className="sticky top-16 bg-white border-b border-gray-200 py-3 px-4 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
          {/* すべてボタン */}
          <Button
            variant={selectedTagIds.length === 0 ? "default" : "outline"}
            size="sm"
            className={`flex-shrink-0 rounded-full ${
              selectedTagIds.length === 0
                ? "bg-secondary text-white hover:bg-secondary/80"
                : "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary hover:text-white"
            }`}
            onClick={() => {
              selectedTagIds.forEach(tagId => onTagToggle(tagId));
            }}
          >
            すべて
          </Button>

          {/* Tag chips */}
          {displayTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              isSelected={selectedTagIds.includes(tag.id)}
              onClick={() => onTagToggle(tag.id)}
            />
          ))}

          {/* Show more/less toggle */}
          {allTags.length > commonTags.length && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-gray-600 hover:text-gray-800"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? '簡潔表示' : `他${allTags.length - commonTags.length}件`}
            </Button>
          )}

          {/* 詳細検索 */}
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 bg-gray-100 text-gray-700 border-gray-200 rounded-full hover:bg-gray-200"
            onClick={onAdvancedSearch}
          >
            <Filter className="w-4 h-4 mr-1" />
            <span>詳細検索</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
