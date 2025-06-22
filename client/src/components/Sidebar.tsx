import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MessageSquare, 
  Plus, 
  Building, 
  Settings, 
  Shield,
  BarChart3,
  LogOut,
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: complaints = [] } = useQuery({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const userComplaints = user?.isAdmin ? complaints : complaints.filter((c: any) => c.userId === user?.id);
  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

  const isActive = (path: string) => location === path;

  if (!user) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-neutral-200 lg:translate-x-0">
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-8 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">PseudoResolve</h1>
            <p className="text-xs text-neutral-500">Anonymous Complaints</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.pseudonym.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-700 truncate">
              {user.pseudonym}
            </p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-neutral-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1 flex-1">
        <Link href="/dashboard">
          <a className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive("/dashboard") || isActive("/") 
              ? "bg-primary text-white" 
              : "text-neutral-700 hover:bg-neutral-100"
          )}>
            <Home className="mr-3" size={16} />
            Dashboard
          </a>
        </Link>

        <Link href="/complaints">
          <a className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive("/complaints") 
              ? "bg-primary text-white" 
              : "text-neutral-700 hover:bg-neutral-100"
          )}>
            <MessageSquare className="mr-3" size={16} />
            My Complaints
            {userComplaints.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {userComplaints.length}
              </Badge>
            )}
          </a>
        </Link>

        <Link href="/organizations">
          <a className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive("/organizations") 
              ? "bg-primary text-white" 
              : "text-neutral-700 hover:bg-neutral-100"
          )}>
            <Building className="mr-3" size={16} />
            Organizations
          </a>
        </Link>

        {user.isAdmin && (
          <div className="pt-4 border-t border-neutral-200 mt-4">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <Link href="/admin">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive("/admin") 
                  ? "bg-primary text-white" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <BarChart3 className="mr-3" size={16} />
                Admin Dashboard
                {complaints.filter((c: any) => c.status === 'escalated').length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {complaints.filter((c: any) => c.status === 'escalated').length}
                  </Badge>
                )}
              </a>
            </Link>
          </div>
        )}

        <Link href="/settings">
          <a className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive("/settings") 
              ? "bg-primary text-white" 
              : "text-neutral-700 hover:bg-neutral-100"
          )}>
            <Settings className="mr-3" size={16} />
            Settings
          </a>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start"
        >
          <LogOut className="mr-2" size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
}
