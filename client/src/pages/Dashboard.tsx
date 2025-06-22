import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintCard from "@/components/ComplaintCard";
import AdminDashboard from "@/components/AdminDashboard";
import Chatbot from "@/components/Chatbot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Building, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { user } = useAuth();

  const { data: complaints = [] } = useQuery({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/complaints/stats"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: !!user,
  });

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  const userComplaints = user?.isAdmin ? complaints : complaints.filter((c: any) => c.userId === user?.id);
  const recentComplaints = userComplaints.slice(0, 5);

  const currentOrg = organizations.find((org: any) => org.id === user?.organizationId);

  const totalComplaints = userComplaints.length;
  const resolvedComplaints = userComplaints.filter((c: any) => c.status === 'resolved').length;
  const pendingComplaints = userComplaints.filter((c: any) => c.status === 'pending').length;
  const escalatedComplaints = userComplaints.filter((c: any) => c.status === 'escalated').length;

  if (showAdmin && user?.isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="lg:ml-64">
          <header className="bg-white shadow-sm border-b border-neutral-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAdmin(false)}
                  className="lg:hidden"
                >
                  ← Back to Dashboard
                </Button>
                
                <div className="flex items-center space-x-4">
                  {currentOrg && (
                    <div className="hidden sm:flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-700">{currentOrg.name}</p>
                        <p className="text-xs text-neutral-500">Organization</p>
                      </div>
                      <div className="w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center">
                        <Building className="text-neutral-600" size={16} />
                      </div>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell size={20} />
                        {unreadNotifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                            {unreadNotifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      {notifications.slice(0, 5).map((notification: any) => (
                        <DropdownMenuItem key={notification.id}>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-neutral-600">{notification.message}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <AdminDashboard />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {currentOrg && (
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-700">{currentOrg.name}</p>
                      <p className="text-xs text-neutral-500">Organization</p>
                    </div>
                    <div className="w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <Building className="text-neutral-600" size={16} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {user?.isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdmin(true)}
                  >
                    Admin Dashboard
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell size={20} />
                      {unreadNotifications.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                          {unreadNotifications.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <DropdownMenuItem key={notification.id}>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-neutral-600">{notification.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Dashboard</h1>
            <p className="text-neutral-600">Welcome back! Here's an overview of your complaint activity.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Complaints</p>
                    <p className="text-3xl font-bold text-neutral-800 mt-1">{totalComplaints}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Badge variant="secondary">{totalComplaints}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Resolved</p>
                    <p className="text-3xl font-bold text-neutral-800 mt-1">{resolvedComplaints}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">{resolvedComplaints}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Pending</p>
                    <p className="text-3xl font-bold text-neutral-800 mt-1">{pendingComplaints}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">{pendingComplaints}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Escalated</p>
                    <p className="text-3xl font-bold text-neutral-800 mt-1">{escalatedComplaints}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Badge variant="destructive">{escalatedComplaints}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Complaints */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Complaints</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentComplaints.map((complaint: any) => (
                      <ComplaintCard key={complaint.id} complaint={complaint} />
                    ))}
                    {recentComplaints.length === 0 && (
                      <div className="text-center py-8 text-neutral-500">
                        No complaints yet. Click "New Complaint" to get started.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              {/* Quick Submit */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Submit</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Submit a new complaint anonymously and securely.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => setShowComplaintForm(true)}
                    disabled={!user?.organizationId}
                  >
                    <Plus className="mr-2" size={16} />
                    New Complaint
                  </Button>
                  {!user?.organizationId && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Join an organization first to submit complaints
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Category Distribution */}
              {stats?.byCategory && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Complaint Categories</h3>
                    <div className="space-y-3">
                      {stats.byCategory.map((item: any) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-sm text-neutral-700 capitalize">{item.category}</span>
                          </div>
                          <span className="text-sm font-medium text-neutral-800">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <ComplaintForm 
        open={showComplaintForm} 
        onClose={() => setShowComplaintForm(false)} 
      />

      <Chatbot 
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />
    </div>
  );
}
