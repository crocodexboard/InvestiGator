import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creator from "@/pages/Creator";
import Moderator from "@/pages/Moderator";
import EventBoard from "@/pages/EventBoard";
import BulletinBoard from "@/pages/BulletinBoard";
import MapView from "@/pages/MapView";
import EditProfile from "@/pages/EditProfile";
import Auth from "@/pages/Auth";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const publicPaths = ["/", "/events", "/bulletin", "/moderator", "/map"];
  const isPublic = publicPaths.some(p => location === p || location.startsWith(p + "/"));

  if (!user && !isPublic) {
    return <Auth />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGate>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creator" component={Creator} />
        <Route path="/moderator" component={Moderator} />
        <Route path="/events" component={EventBoard} />
        <Route path="/bulletin" component={BulletinBoard} />
        <Route path="/map" component={MapView} />
        <Route path="/edit/:id" component={EditProfile} />
        <Route component={NotFound} />
      </Switch>
    </AuthGate>
  );
}

function AppContent() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen scanlines vhs-flicker bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
