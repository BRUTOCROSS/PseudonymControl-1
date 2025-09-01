import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Bot
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";

export default function UserDashboard() {
  const [showChatbot, setShowChatbot] = useState(false);
  const { user } = useAuth();

  const { data: complaints = [] } = useQuery({
    queryKey: ["/api/complaints"],
  });

  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
  });

  const currentOrg = Array.isArray(organizations) && user?.organizationId 
    ? organizations.find((org: any) => org.id === user.organizationId)
    : null;

  const userComplaints = Array.isArray(complaints) 
    ? complaints.filter((complaint: any) => complaint.userId === user?.id)
    : [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'escalated':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'escalated':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar userRole="user" />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-neutral-200 h-16 flex items-center px-6">
          <div className="flex items-center space-x-4">
            <Building className="text-primary" size={20} />
            <div>
              <h1 className="text-lg font-semibold text-neutral-800">Dashboard</h1>
              <p className="text-xs text-neutral-500">{currentOrg?.name || 'Loading...'}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="outline">
              {user?.pseudonym}
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 mb-1">
                      Welcome, {user?.pseudonym}!
                    </h2>
                    <p className="text-blue-700">
                      Use the AI chatbot in the bottom-right corner to submit anonymous complaints and get assistance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userComplaints.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userComplaints.filter((c: any) => c.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userComplaints.filter((c: any) => c.status === 'resolved').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="text-primary" size={20} />
                <span>My Complaints</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userComplaints.length > 0 ? (
                <div className="space-y-4">
                  {userComplaints.map((complaint: any) => {
                    const StatusIcon = getStatusIcon(complaint.status);
                    return (
                      <div key={complaint.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className="text-neutral-500" size={16} />
                            <div>
                              <h3 className="font-medium text-neutral-800">
                                Complaint #{complaint.id}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(complaint.status)}>
                              {complaint.status}
                            </Badge>
                            {complaint.category && (
                              <Badge variant="outline">{complaint.category}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-neutral-700 mb-3">
                          {complaint.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {complaint.similarityGroup && (
                              <Badge variant="secondary" className="text-xs">
                                Similar complaints grouped
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-neutral-500">
                            {complaint.status === 'pending' && 'Under review'}
                            {complaint.status === 'resolved' && 'Issue has been addressed'}
                            {complaint.status === 'escalated' && 'Escalated to management'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Complaints Yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Use the AI chatbot to submit your first anonymous complaint.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                    <Bot size={16} />
                    <span>Click the chat button in the bottom-right corner</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Chatbot 
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />
    </div>
  );
}