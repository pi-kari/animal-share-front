// 共通エンティティ
export type TagCategory = "分類" | "角度" | "パーツ" | "自由";

export type Tag = {
  id: string;
  name: string;
  category: TagCategory;
};

export type UserLite = {
  id: string;
  firstName?: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
};

export type Post = {
  id: string;
  imageUrl: string;
  publicId?: string;        // Cloudinary 用（後で使う）
  width?: number;
  height?: number;
  format?: string;
  caption?: string;
  createdAt: string;        // ISO
  userId: string;
};

export type PostWithTags = Post & {
  tags: Tag[];
  user: UserLite;
};

export type CreatePostReq = {
  imageUrl: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  caption?: string;
  tagIds: string[]; // 分類タグ１つ以上はフロント側で担保
};

// API レスポンスの“契約”サマリ
export namespace API {
  // GET /api/tags
  export type GetTags_Res = Tag[];

  // GET /api/posts?tagIds=&excludeTagIds=
  export type GetPosts_Res = PostWithTags[];

  // POST /api/posts
  export type CreatePost_Req = CreatePostReq;
  export type CreatePost_Res = { ok: true; post?: PostWithTags } | { ok: false; error: string };

  // GET /api/favorites
  export type GetFavorites_Res = PostWithTags[];

  // POST /api/favorites/:postId
  export type AddFavorite_Res = { ok: true };

  // DELETE /api/favorites/:postId
  export type RemoveFavorite_Res = { ok: true };

  // GET /api/user/excluded-tags
  export type GetExcludedTags_Res = string[];

  // POST /api/user/excluded-tags
  export type SaveExcludedTags_Req = { tagIds: string[] };
  export type SaveExcludedTags_Res = { ok: true };

  // GET /api/auth/me
  export type GetMe_Res = UserLite | null;
}
