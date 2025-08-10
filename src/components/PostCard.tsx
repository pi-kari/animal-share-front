// src/components/PostCard.tsx
import type { PostWithTags } from "@/types";

type Props = {
  post: PostWithTags;
  onClick?: () => void;
};

export function PostCard({ post, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <img
        src={post.imageUrl}
        alt={post.caption ?? "post"}
        className="block w-full h-auto aspect-[4/5] object-cover"
        loading="lazy"
      />
      <div className="p-3 space-y-2">
        {post.caption ? (
          <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
        ) : null}

        {Array.isArray(post.tags) && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}
