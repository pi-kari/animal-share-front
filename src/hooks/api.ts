// src/hooks/api.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { API, PostWithTags, Tag } from "@/types/api";

/** 配列ガード：配列でなければ空配列にする */
function toArray<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

/* ===================== Tags ===================== */

export function useTags() {
  // defaultQueryFn が queryKey[0] を叩くので queryFn は不要
  return useQuery<API.GetTags_Res>({ queryKey: ["/api/tags"] });
}

/* ================= Excluded Tags ================= */

export function useExcludedTags() {
  const q = useQuery<Tag[]>({
    queryKey: ["/api/exclude-tags"],
    queryFn: async () => {
      const res = await apiRequest<Tag[]>("/api/exclude-tags");
      return Array.isArray(res) ? res : [];
    },
  });

  const tags = Array.isArray(q.data) ? q.data : [];
  const excludedIds = tags.map((t) => String(t.id));

  return { excludedIds, tags, ...q };
}

export function useSaveExcludedTags() {
  const qc = useQueryClient();
  return useMutation({
    // payload は { tagIds: string[] } を期待する
    mutationFn: (payload: { tagIds: string[] }) =>
      apiRequest<API.SaveExcludedTags_Res>("/api/exclude-tags", {
        method: "POST",
        json: { tagIds: payload.tagIds },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/exclude-tags"] });
      // 検索/ホームの再取得もしたい場合は下をON
      // qc.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

/* ===================== Posts ===================== */

type UsePostsParams = {
  tagIds?: string[];
  excludeTagIds?: string[];
};

export function usePosts(params: UsePostsParams) {
  // params は queryKey[1] に入り、defaultQueryFn が ?xxx= に展開する
  return useQuery<PostWithTags[] | unknown>({
    queryKey: ["/api/posts", params],
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: API.CreatePost_Req) =>
      apiRequest<API.CreatePost_Res>("/api/posts", {
        method: "POST",
        json: body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

/* =================== Favorites =================== */

export function useFavorites() {
  return useQuery<API.GetFavorites_Res>({ queryKey: ["/api/favorites"] });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      apiRequest<API.AddFavorite_Res>(
        `/api/favorites/${encodeURIComponent(postId)}`,
        {
          method: "POST",
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      apiRequest<API.RemoveFavorite_Res>(
        `/api/favorites/${encodeURIComponent(postId)}`,
        {
          method: "DELETE",
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

/* ============== ヘルパー（UI向け） ============== */

export function useSafeTags() {
  const { data, ...rest } = useTags();
  const allTags = toArray<Tag>(data);
  return { allTags, ...rest };
}

export function useSafePosts(params: UsePostsParams) {
  const { data, ...rest } = usePosts(params);
  const posts = toArray<PostWithTags>(data);
  return { posts, ...rest };
}
