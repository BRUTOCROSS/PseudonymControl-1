import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import ComplaintCard from "@/components/ComplaintCard";
import ComplaintForm from "@/components/ComplaintForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Complaints() {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { user } = useAuth();

  const { data: complaints = [] } = useQuery({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const userComplaints = user?.isAdmin ? complaints : complaints.filter((c: any) => c.userId === user?.id);

  const filteredComplaints = userComplaints.filter((complaint: any) => {
    if (statusFilter && complaint.status !== statusFilter) return false;
    if (categoryFilter && complaint.category !== categoryFilter) return false;
    return true;
  });

  const pendingComplaints = filteredComplaints.filter((c: any) => c.status === 'pending');
  const resolvedComplaints = filteredComplaints.filter((c: any) => c.status === 'resolved');
  const escalatedComplaints = filteredComplaints.filter((c: any) => c.status === 'escalated');

  const handleViewComplaint = (complaint: any) => {
    // TODO: Open complaint detail modal/page
    console.log("View complaint:", complaint);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="lg:ml-64">
        <main className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-2">
                {user?.isAdmin ? 'All Complaints' : 'My Complaints'}
              </h1>
              <p className="text-neutral-600">
                {user?.isAdmin ? 'Manage all organization complaints' : 'Track your submitted complaints and their resolution status.'}
              </p>
            </div>

            {!user?.isAdmin && (
              <Button 
                onClick={() => setShowComplaintForm(true)}
                disabled={!user?.organizationId}
              >
                <Plus className="mr-2" size={16} />
                New Complaint
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={16} />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                {(statusFilter || categoryFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("");
                      setCategoryFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Complaints Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({filteredComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({resolvedComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="escalated">
                Escalated ({escalatedComplaints.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 gap-4">
                {filteredComplaints.map((complaint: any) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={handleViewComplaint}
                  />
                ))}
                {filteredComplaints.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-neutral-500 mb-4">No complaints found matching your filters.</p>
                      {!user?.isAdmin && (
                        <Button onClick={() => setShowComplaintForm(true)}>
                          Submit Your First Complaint
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="grid grid-cols-1 gap-4">
                {pendingComplaints.map((complaint: any) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={handleViewComplaint}
                  />
                ))}
                {pendingComplaints.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-neutral-500">No pending complaints.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved">
              <div className="grid grid-cols-1 gap-4">
                {resolvedComplaints.map((complaint: any) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={handleViewComplaint}
                  />
                ))}
                {resolvedComplaints.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-neutral-500">No resolved complaints yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="escalated">
              <div className="grid grid-cols-1 gap-4">
                {escalatedComplaints.map((complaint: any) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={handleViewComplaint}
                  />
                ))}
                {escalatedComplaints.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-neutral-500">No escalated complaints.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ComplaintForm 
        open={showComplaintForm} 
        onClose={() => setShowComplaintForm(false)} 
      />
    </div>
  );
}