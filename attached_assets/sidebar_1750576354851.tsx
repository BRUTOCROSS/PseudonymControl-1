import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = "user" }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-neutral-200">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="font-medium">{user?.pseudonym?.charAt(0) || 'A'}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">{user?.pseudonym || 'Anonymous User'}</p>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                <p className="text-xs text-neutral-500">Online</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            <Link href="/dashboard">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/dashboard") 
                  ? "bg-neutral-100 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <svg className={cn(
                  "mr-3 h-5 w-5",
                  isActive("/dashboard") ? "text-primary" : "text-neutral-500 group-hover:text-neutral-600"
                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
            </Link>

            <Link href="/organizations">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/organizations") 
                  ? "bg-neutral-100 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <svg className={cn(
                  "mr-3 h-5 w-5",
                  isActive("/organizations") ? "text-primary" : "text-neutral-500 group-hover:text-neutral-600"
                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Organizations
              </a>
            </Link>

            <Link href="/complaints">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/complaints") 
                  ? "bg-neutral-100 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <svg className={cn(
                  "mr-3 h-5 w-5",
                  isActive("/complaints") ? "text-primary" : "text-neutral-500 group-hover:text-neutral-600"
                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Complaints
              </a>
            </Link>

            <Link href="/analytics">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/analytics") 
                  ? "bg-neutral-100 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <svg className={cn(
                  "mr-3 h-5 w-5",
                  isActive("/analytics") ? "text-primary" : "text-neutral-500 group-hover:text-neutral-600"
                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </a>
            </Link>

            <Link href="/settings">
              <a className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/settings") 
                  ? "bg-neutral-100 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <svg className={cn(
                  "mr-3 h-5 w-5",
                  isActive("/settings") ? "text-primary" : "text-neutral-500 group-hover:text-neutral-600"
                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={() => logout()}
            className="flex items-center text-sm text-neutral-700 hover:text-primary"
          >
            <svg className="mr-2 h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}