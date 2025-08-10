import { useState } from "react";
import { Link } from "wouter";
import { Heart, Plus, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onSearch?: (q: string) => void;
  onOpenUpload?: () => void;
};

export function Header({ onSearch, onOpenUpload }: Props) {
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const avatar = user?.profileImageUrl || user?.avatarUrl;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="text-xl font-extrabold text-primary">
          AnimalShare
        </Link>

        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.(q);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="動物を検索…"
              className="w-full h-9 rounded-full border border-gray-300 px-4 text-sm"
            />
          </form>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="新規投稿"
          onClick={onOpenUpload}
          className="mr-1"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <Link href="/favorites" className="p-2 rounded-full hover:bg-gray-100">
          <Heart className="w-5 h-5" />
        </Link>

        <Link href="/profile" className="ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden grid place-items-center">
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-white" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
