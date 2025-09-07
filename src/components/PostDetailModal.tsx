import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Heart, Share } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TagChip } from "./TagChip";
import { PostWithTags } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PostDetailModalProps {
  post: PostWithTags | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
}: PostDetailModalProps) {
  const [isFavorited, setIsFavorited] = useState(post?.isFavorited || false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async ({
      postId,
      action,
    }: {
      postId: string;
      action: "add" | "remove";
    }) => {
      if (action === "add") {
        await apiRequest("/api/favorites", {
          method: "POST",
          json: { postId },
        });
      } else {
        await apiRequest(`/api/favorites/${postId}`, {
          method: "DELETE",
          json: { postId },
        });
      }
    },
    onSuccess: (_, variables) => {
      setIsFavorited(variables.action === "add");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });

      toast({
        title: variables.action === "add" ? "お気に入り追加" : "お気に入り削除",
        description:
          variables.action === "add"
            ? "お気に入りに追加しました。"
            : "お気に入りから削除しました。",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "ログインが必要です",
          description: "お気に入り機能を使用するにはログインしてください。",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${
            import.meta.env?.VITE_API_BASE_URL
          }/api/auth/google`;
        }, 1000);
        return;
      }

      toast({
        title: "エラー",
        description: "操作に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (!post) return;

    const action = isFavorited ? "remove" : "add";
    favoriteMutation.mutate({ postId: post.id, action });
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      await navigator.share({
        title: "カクミル - 動物写真",
        text: post.caption || "可愛い動物の写真をシェア！",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "リンクをコピーしました",
          description: "URLがクリップボードにコピーされました。",
        });
      } catch (clipboardError) {
        toast({
          title: "シェアできませんでした",
          description: "お使いのブラウザではシェア機能をご利用いただけません。",
          variant: "destructive",
        });
      }
    }
  };

  if (!post) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  // Group related tags (exclude already displayed tags)
  const relatedTags = post.tags.filter((tag) => tag.category === "自由");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:flex-1 bg-black flex items-center justify-center">
            <img
              src={post.imageUrl}
              alt={post.caption || "Animal photo"}
              className="max-w-full max-h-[50vh] lg:max-h-[80vh] object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="lg:w-96 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  {post.user.profileImageUrl ? (
                    <img
                      src={post.user.profileImageUrl}
                      alt="User avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {(post.user.firstName ||
                        post.user.email ||
                        "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-dark">
                    {post.user.firstName || post.user.email || "ユーザー"}
                  </h3>
                  <p className="text-sm text-gray-500">{timeAgo}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="mb-6">
                <p className="text-neutral-dark whitespace-pre-wrap">
                  {post.caption}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 ${
                  isFavorited
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={handleFavoriteToggle}
                disabled={favoriteMutation.isPending}
              >
                <Heart
                  className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`}
                />
                <span className="text-sm">
                  {isFavorited ? "お気に入り済み" : "お気に入り"}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-600 hover:text-secondary"
                onClick={handleShare}
              >
                <Share className="w-6 h-6" />
                <span className="text-sm">シェア</span>
              </Button>
            </div>

            {/* Related Tags */}
            {relatedTags.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-dark mb-3">
                  関連するタグ
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.slice(0, 6).map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-gray-100 text-gray-700 border-gray-200 hover:bg-secondary hover:text-white"
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
