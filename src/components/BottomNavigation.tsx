import { Link } from "wouter";
import { Home, Plus, Heart, User } from "lucide-react";

type Props = { onOpenUpload?: () => void };

export function BottomNavigation({ onOpenUpload }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl h-14 grid grid-cols-4">
        <Link href="/" className="grid place-items-center hover:bg-gray-50">
          <Home className="w-6 h-6" />
        </Link>
        <button
          className="grid place-items-center hover:bg-gray-50"
          onClick={onOpenUpload}
        >
          <Plus className="w-6 h-6" />
        </button>
        <Link
          href="/favorites"
          className="grid place-items-center hover:bg-gray-50"
        >
          <Heart className="w-6 h-6" />
        </Link>
        <Link
          href="/profile"
          className="grid place-items-center hover:bg-gray-50"
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}
