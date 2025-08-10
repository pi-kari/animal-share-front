// src/components/UploadModal.tsx
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TagChip } from "./TagChip";
import { apiRequest } from "@/lib/queryClient";
import type { Tag, CreatePostData, TagCategory } from "@/types";

/* =========================
   ユーティリティ：必ず配列にする
========================= */
function toTagArray(x: unknown): Tag[] {
  if (Array.isArray(x)) return x as Tag[];
  if (x && typeof x === "object") {
    const obj = x as any;
    if (Array.isArray(obj.data)) return obj.data as Tag[];
    if (Array.isArray(obj.tags)) return obj.tags as Tag[];
  }
  return [];
}

/* =========================
   折りたたみタグセクション
========================= */
function TagSection({
  title,
  required = false,
  tags,
  selectedTagIds,
  onToggle,
  defaultOpen = false,
}: {
  title: string;
  required?: boolean;
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-sm font-medium">
          {title} {required && <span className="text-primary">*</span>}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3">
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTagIds.includes(tag.id)}
                  onClick={() => onToggle(tag.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-medium">タグがありません</p>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   メイン：UploadModal
========================= */
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  // ---- Hooks（順序固定）----
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // プレビューURL
  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : ""),
    [selectedImage]
  );

  // タグ一覧（失敗しても空配列扱い）
  const { data: allTagsRaw } = useQuery<Tag[] | unknown>({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      try {
        return await apiRequest<Tag[]>("/api/tags");
      } catch {
        return [];
      }
    },
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const allTags: Tag[] = toTagArray(allTagsRaw); // ← ここで必ず配列に

  // 投稿作成
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      return await apiRequest("/api/posts", { method: "POST", json: data });
    },
    onSuccess: () => {
      toast({ title: "投稿完了", description: "投稿が正常にアップロードされました。" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "投稿エラー",
        description: error?.message || "投稿に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // タグ作成
  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; category: TagCategory }) => {
      return await apiRequest("/api/tags", { method: "POST", json: tagData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      setNewTagName("");
    },
  });

  // ---- Handlers（フックの後に置く）----
  const handleClose = () => {
    setSelectedImage(null);
    setCaption("");
    setSelectedTagIds([]);
    setNewTagName("");
    onClose();
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) setSelectedImage(f);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedImage(f);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const addNewTag = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate({ name: newTagName.trim(), category: "自由" });
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error("Cloudinary configuration missing");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.secure_url as string;
  };

  // カテゴリ別
  const tagsByCategory = {
    分類: allTags.filter((t) => t.category === "分類"),
    角度: allTags.filter((t) => t.category === "角度"),
    パーツ: allTags.filter((t) => t.category === "パーツ"),
    自由: allTags.filter((t) => t.category === "自由"),
  };
  const hasClassificationTag = tagsByCategory["分類"].some((t) =>
    selectedTagIds.includes(t.id)
  );

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "画像が必要です",
        description: "投稿するには画像を選択してください。",
        variant: "destructive",
      });
      return;
    }
    if (!hasClassificationTag) {
      toast({
        title: "分類タグが必要です",
        description: "少なくとも1つの分類タグを選択してください。",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUploading(true);
      const imageUrl = await uploadToCloudinary(selectedImage);
      await createPostMutation.mutateAsync({
        imageUrl,
        caption: caption.trim() || undefined,
        tagIds: selectedTagIds,
      });
    } catch (e: any) {
      toast({
        title: "アップロードエラー",
        description: e?.message ?? "画像のアップロードに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ★ すべてのフック＆関数定義の“後”に配置（Hook順序を崩さない）
  if (!isOpen) return null;

  // ---- UI ----
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* 狭めの上下レイアウト。スマホもPCも同じ構成 */}
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-dark text-center">
            新しい投稿
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 画像：スマホさらに小さめ */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">画像</Label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full object-contain rounded-lg border border-gray-200 max-h-32 sm:max-h-40 md:max-h-48"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">写真をドラッグ&ドロップ</p>
                <p className="text-xs text-gray-500 mb-2">または</p>
                <Button type="button" size="sm" className="bg-primary hover:bg-primary/90">
                  ファイルを選択
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* キャプション */}
          <div>
            <Label htmlFor="caption" className="text-sm font-medium text-gray-700 mb-1 block">
              キャプション（任意）
            </Label>
            <Textarea
              id="caption"
              rows={3}
              placeholder="この写真について教えてください..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* タグ（折りたたみ） */}
          <div className="space-y-3">
            <TagSection
              title="分類タグ"
              required
              tags={tagsByCategory["分類"]}
              selectedTagIds={selectedTagIds}
              onToggle={toggleTag}
              defaultOpen
            />
            <TagSection
              title="角度タグ（任意）"
              tags={tagsByCategory["角度"]}
              selectedTagIds={selectedTagIds}
              onToggle={toggleTag}
            />
            <TagSection
              title="パーツタグ（任意）"
              tags={tagsByCategory["パーツ"]}
              selectedTagIds={selectedTagIds}
              onToggle={toggleTag}
            />
            <div className="space-y-2">
              <TagSection
                title="自由タグ（任意）"
                tags={tagsByCategory["自由"]}
                selectedTagIds={selectedTagIds}
                onToggle={toggleTag}
              />
              {/* 自由タグの追加 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="新しいタグを入力…"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNewTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addNewTag}
                  disabled={!newTagName.trim() || createTagMutation.isPending}
                  className="bg-accent-yellow text-foreground hover:bg-accent-yellow/90"
                >
                  追加
                </Button>
              </div>
            </div>
          </div>

          {/* アクション */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={createPostMutation.isPending || isUploading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={
                !selectedImage ||
                !hasClassificationTag ||
                createPostMutation.isPending ||
                isUploading
              }
            >
              {isUploading ? "アップロード中..." : "投稿する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
