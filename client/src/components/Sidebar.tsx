import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  Building, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  Shield
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = "user" }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    {
      href: "/",
      icon: BarChart3,
      label: "Dashboard",
      show: true
    },
    {
      href: "/complaints",
      icon: MessageSquare,
      label: "Complaints",
      show: true
    },
    {
      href: "/organizations",
      icon: Building,
      label: "Organizations",
      show: true
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      show: true
    }
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">PseudoResolve</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <Link key={item.href} href={item.href}>
                {(params) => (
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      params.href === item.href || (item.href === "/" && params.href === "")
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
        </nav>
      </div>

      {user && (
        <div className="border-t p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user.pseudonym}</p>
            <p className="text-xs text-gray-500">{user.username}</p>
            {user.isAdmin && (
              <div className="flex items-center mt-1">
                <Shield className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-500">Admin</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}