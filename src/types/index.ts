export type TagCategory = '分類' | '角度' | 'パーツ' | '自由';

export type Tag = {
  id: string;
  name: string;
  category: TagCategory;
  createdAt: string;
};

export type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
};

export type PostWithTags = Post & {
  tags: Tag[];
  user: User;
  isFavorited?: boolean;
};

export type CreatePostData = {
  imageUrl: string;
  caption?: string;
  tagIds: string[];
};

export type SearchFilters = {
  tagIds: string[];
  category?: TagCategory;
};
