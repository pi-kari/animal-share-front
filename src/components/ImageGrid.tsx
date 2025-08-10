import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { TagChip } from "./TagChip";
import type { PostWithTags } from "@/types";

interface ImageGridProps {
  /** 投稿配列。配列でなくても受け取り側で安全に無害化します */
  posts?: PostWithTags[] | unknown;
  onPostClick?: (post: PostWithTags) => void;
  isLoading?: boolean;
  /** 0件のときに空表示を出すか（デフォルト true） */
  showEmptyState?: boolean;
}

export function ImageGrid({
  posts,
  onPostClick,
  isLoading = false,
  showEmptyState = true,
}: ImageGridProps) {
  // ここで “絶対に配列化” してから使う
  const list: PostWithTags[] = Array.isArray(posts) ? (posts as PostWithTags[]) : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="w-full h-64 bg-gray-200" />
              <div className="p-4">
                <div className="flex space-x-2 mb-3">
                  <div className="h-6 bg-gray-200 rounded-full w-12" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🐾</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">投稿が見つかりません</h3>
          <p className="text-gray-500">条件を変更して再度お試しください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((post) => {
          // createdAt が無い場合にも落ちないように防御
          let timeAgo = "";
          if (post?.createdAt) {
            try {
              timeAgo = formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ja,
              });
            } catch {
              timeAgo = "";
            }
          }

          const tags = Array.isArray(post?.tags) ? post.tags : [];
          const displayName = post?.user?.firstName || post?.user?.email || "ユーザー";
          const avatar = post?.user?.profileImageUrl;

          return (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => onPostClick?.(post)}
            >
              <img
                src={post.imageUrl}
                alt={post.caption || "Animal photo"}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.slice(0, 3).map((tag) => (
                    <TagChip key={tag.id} tag={tag} size="sm" />
                  ))}
                  {tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600 truncate">{displayName}</span>
                  {timeAgo && (
                    <span className="text-sm text-gray-400 flex-shrink-0">{timeAgo}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
