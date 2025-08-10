// src/pages/Settings.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TagChip } from "@/components/TagChip";
import { apiRequest } from "@/lib/queryClient";
import { useExcludedTags, useSaveExcludedTags } from "@/hooks/api";
import type { Tag } from "@/types";

/* ================== 定数/型ユーティリティ ================== */

// あなたの Tag 型が '分類' | '角度' | 'パーツ' | '自由' の Union でない場合でも安全に動くように定義
const CATEGORIES = ["分類", "角度", "パーツ", "自由"] as const;
type Category = (typeof CATEGORIES)[number];

function isCategory(x: unknown): x is Category {
  return typeof x === "string" && (CATEGORIES as readonly string[]).includes(x);
}

// 必ず Tag 形に整える（createdAt を補完）
function toTagArray(x: unknown): Tag[] {
  const now = new Date().toISOString();
  if (!Array.isArray(x)) return [];
  return x
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const o = v as any;
      const category = isCategory(o?.category) ? o.category : "自由";
      return {
        id: String(o?.id ?? crypto.randomUUID()),
        name: String(o?.name ?? "タグ"),
        category,
        createdAt: String(o?.createdAt ?? now), // ★ Tag の必須プロパティを満たす
      } as Tag;
    });
}

function groupByCategory(tags: Tag[]) {
  const base: Record<Category, Tag[]> = {
    分類: [],
    角度: [],
    パーツ: [],
    自由: [],
  };
  for (const t of tags) {
    const cat = isCategory(t.category) ? t.category : "自由";
    base[cat].push(t);
  }
  return base;
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  for (const x of b) if (!sa.has(x)) return false;
  return true;
}

/* ================== 本体 ================== */

export function Settings() {
  const { toast } = useToast();

  // プロフィール（ダミー）
  const NAME_MAX = 30;
  const BIO_MAX = 160;
  const [name, setName] = useState("プレビュー太郎");
  const [bio, setBio] = useState("どうぶつ大好き！ねこ派です。");

  // タグ取得（必ず Tag[] に整形）
  const {
    data: tagsData,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      try {
        const res = await apiRequest<Tag[]>("/api/tags");
        return toTagArray(res);
      } catch {
        const now = new Date().toISOString();
        // ★ モックも Tag 形（createdAt 含む）
        const mock: Tag[] = [
          { id: "t-neko", name: "猫", category: "分類", createdAt: now },
          { id: "t-inu", name: "犬", category: "分類", createdAt: now },
          { id: "t-yoko", name: "横", category: "角度", createdAt: now },
          { id: "t-shita", name: "下", category: "角度", createdAt: now },
          { id: "t-mimi", name: "耳", category: "パーツ", createdAt: now },
          { id: "t-sippo", name: "しっぽ", category: "パーツ", createdAt: now },
          {
            id: "t-kawaii",
            name: "かわいい",
            category: "自由",
            createdAt: now,
          },
        ];
        return mock;
      }
    },
    staleTime: 30_000,
    retry: 0,
  });

  const allTags: Tag[] = useMemo(() => toTagArray(tagsData), [tagsData]);
  const byCat = useMemo(() => groupByCategory(allTags), [allTags]);

  // 除外タグ
  const { excludedIds: serverExcluded, isLoading: isExcludedLoading } =
    useExcludedTags();
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const initialRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (!isExcludedLoading) {
      // 配列の中身が変わっている場合のみ更新する
      const isEqual =
        serverExcluded.length === excludedIds.length &&
        serverExcluded.every((id, i) => id === excludedIds[i]);

      if (!isEqual) {
        setExcludedIds(serverExcluded);
      }

      if (initialRef.current === null) {
        initialRef.current = serverExcluded;
      }
    }
  }, [serverExcluded, isExcludedLoading]);

  const toggleExclude = (id: string) =>
    setExcludedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllIn = (cat: Category) => {
    const ids = byCat[cat].map((t) => t.id);
    setExcludedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };
  const clearIn = (cat: Category) => {
    const ids = new Set(byCat[cat].map((t) => t.id));
    setExcludedIds((prev) => prev.filter((x) => !ids.has(x)));
  };

  const saveZoning = useSaveExcludedTags();
  const hasZoningChanges =
    initialRef.current !== null &&
    !arraysEqual(initialRef.current, excludedIds);

  const handleSaveZoning = async () => {
    try {
      await saveZoning.mutateAsync(excludedIds);
      initialRef.current = excludedIds;
      toast({
        title: "保存しました",
        description: "ゾーニング設定を更新しました。",
      });
    } catch {
      toast({
        title: "保存に失敗しました",
        description: "時間をおいて再度お試しください。",
        variant: "destructive",
      });
    }
  };

  // 通知/表示（ダミー）
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const saveProfile = () => {
    toast({
      title: "保存しました",
      description: "プロフィールを更新しました。",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-bg pb-28 md:pb-32">
      <Header onSearch={() => {}} onOpenUpload={() => {}} />

      <main className="pt-16 mx-auto w-full max-w-4xl px-4 md:px-6 py-6 space-y-8">
        <h1 className="text-3xl font-bold text-neutral-dark">設定</h1>

        {/* 1) プロフィール */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">プロフィール</h2>

          <div className="mb-5 w-full">
            <Label htmlFor="displayName" className="text-sm font-medium">
              表示名
            </Label>
            <div className="mt-1 rounded-xl border border-gray-300 bg-gray-50 focus-within:bg-primary/5 transition-colors duration-200">
              <Input
                id="displayName"
                type="text"
                placeholder="表示名（30文字まで）"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                className="border-none bg-transparent focus:ring-0 w-full"
                aria-describedby="displayNameHelp"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-neutral-medium">
              <span id="displayNameHelp">
                あなたのプロフィールに表示される名前です。
              </span>
              <span>
                {name.length}/{NAME_MAX}
              </span>
            </div>
          </div>

          <div className="mb-5 w-full">
            <Label htmlFor="bio" className="text-sm font-medium">
              自己紹介
            </Label>
            <div className="mt-1 rounded-xl border border-gray-300 bg-gray-50 focus-within:bg-primary/5 transition-colors duration-200">
              <Textarea
                id="bio"
                rows={5}
                placeholder="好きな動物、撮影スタイル、ひとこと など（160文字まで）"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                className="resize-none border-none bg-transparent focus:ring-0 w-full"
                aria-describedby="bioHelp"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-neutral-medium">
              <span id="bioHelp">プロフィール上部に表示されます。</span>
              <span>
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={saveProfile}
            >
              保存
            </Button>
          </div>
        </section>

        {/* 2) ゾーニング（除外タグ） */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              🫣 ゾーニング設定（除外タグ）
            </h2>
            <div className="text-sm text-neutral-medium">
              {isTagsLoading || isExcludedLoading
                ? "読み込み中…"
                : tagsError
                ? "取得に失敗"
                : null}
            </div>
          </div>
          <p className="text-sm text-neutral-medium mb-4">
            選択したタグが付いた投稿はホームや検索に表示されません。いつでも変更できます。
          </p>

          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">
                  {cat}タグ
                  <span className="ml-2 text-xs text-neutral-medium">
                    ({byCat[cat].length}件 / 除外{" "}
                    {
                      byCat[cat].filter((t) => excludedIds.includes(t.id))
                        .length
                    }
                    )
                  </span>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllIn(cat)}
                    disabled={
                      byCat[cat].length === 0 ||
                      byCat[cat].every((t) => excludedIds.includes(t.id))
                    }
                    className="border-gray-200"
                  >
                    すべて除外
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearIn(cat)}
                    disabled={byCat[cat].every(
                      (t) => !excludedIds.includes(t.id)
                    )}
                    className="border-gray-200"
                  >
                    解除
                  </Button>
                </div>
              </div>

              {byCat[cat].length ? (
                <div className="flex flex-wrap gap-2">
                  {byCat[cat].map((tag) => (
                    <TagChip
                      key={tag.id}
                      tag={tag} // Tag 型を満たすのでOK（createdAtあり）
                      isSelected={excludedIds.includes(tag.id)}
                      onClick={() => toggleExclude(tag.id)}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm text-neutral-medium">
                  タグがありません
                </span>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveZoning}
              disabled={!hasZoningChanges || saveZoning.isPending}
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {saveZoning.isPending
                ? "保存中…"
                : hasZoningChanges
                ? "ゾーニングを保存"
                : "変更なし"}
            </Button>
          </div>
        </section>

        {/* 3) 通知 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">通知</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
              <span>メール通知を受け取る</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={pushNotif}
                onChange={(e) => setPushNotif(e.target.checked)}
              />
              <span>プッシュ通知を受け取る</span>
            </label>
          </div>
        </section>

        {/* 4) 表示 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">表示</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
            />
            <span>コンパクトモードを有効化</span>
          </label>
        </section>

        <div className="h-24 md:h-28" />
      </main>

      <BottomNavigation onOpenUpload={() => {}} />
    </div>
  );
}
