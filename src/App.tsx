// src/App.tsx
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

// ページ
import { Home } from "@/pages/Home";
import Login from "@/pages/Login";
import Favorites from "@/pages/Favorites";
import { Profile } from "@/pages/Profile";
import { Settings } from "@/pages/Settings";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const preview = Boolean(import.meta.env.VITE_PREVIEW_AUTH);
  const authed = preview ? true : isAuthenticated;

  if (!preview && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-medium">読み込み中…</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />

      {!authed ? (
        <>
          <Route path="/">
            <Redirect to="/login" />
          </Route>
          <Route>
            <Redirect to="/login" />
          </Route>
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route>
            <Redirect to="/" />
          </Route>
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AppRouter />
    </QueryClientProvider>
  );
}
