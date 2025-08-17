import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Organizations from "./pages/Organizations";
import OrganizationSetup from "./pages/OrganizationSetup";
import Complaints from "./pages/Complaints";
import Settings from "./pages/Settings";
import NotFound from "./pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <Route path="/" component={Landing} />
      ) : !user.organizationId ? (
        <>
          <Route path="/" component={OrganizationSetup} />
          <Route component={OrganizationSetup} />
        </>
      ) : (
        <>
          <Route path="/" component={user?.organizationId ? (user?.isAdmin ? AdminDashboard : UserDashboard) : Organizations} />
          <Route path="/dashboard" component={user?.organizationId ? (user?.isAdmin ? AdminDashboard : UserDashboard) : Organizations} />
          <Route path="/organizations" component={Organizations} />
          <Route path="/complaints" component={Complaints} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
