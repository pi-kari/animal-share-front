import { Home, Search, Plus, Heart, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface BottomNavigationProps {
  onOpenUpload?: () => void;
}

export function BottomNavigation({ onOpenUpload }: BottomNavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-30">
      <div className="flex justify-around items-center py-2">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/') ? "text-primary" : "text-gray-600"
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">ホーム</span>
          </Button>
        </Link>
        
        <Link href="/search">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/search') ? "text-primary" : "text-gray-600"
            }`}
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">検索</span>
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center py-2 px-3 text-gray-600"
          onClick={onOpenUpload}
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs">投稿</span>
        </Button>
        
        <Link href="/favorites">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/favorites') ? "text-primary" : "text-gray-600"
            }`}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span className="text-xs">お気に入り</span>
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/profile') ? "text-primary" : "text-gray-600"
            }`}
          >
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full mb-1 flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-xs">プロフィール</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
