import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart3,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Users,
  FileText,
  Eye,
  Brain
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// Helper function to format dates (assuming it's needed elsewhere and not provided in changes)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function AdminDashboard() {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints = [] } = useQuery({
    queryKey: ["/api/complaints"],
  });

  const { data: groupedComplaints, isLoading: isLoadingGrouped } = useQuery<any>({
    queryKey: ["/api/complaints/grouped"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/complaints/grouped");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });

  const { data: stats = {} } = useQuery<any>({
    queryKey: ["/api/complaints/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/complaints/stats");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });

  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
  });

  const currentOrg = Array.isArray(organizations) && user?.organizationId
    ? organizations.find((org: any) => org.id === user.organizationId)
    : null;

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/complaints/${id}`, { status });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update complaint');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/grouped"] }); // Invalidate grouped complaints as well
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/stats"] });
      toast({
        title: "Complaint Updated",
        description: "The complaint status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint",
        variant: "destructive",
      });
    },
  });

  const updateThresholdMutation = useMutation({
    mutationFn: async (thresholdPercentage: number) => {
      const response = await apiRequest("PATCH", `/api/organizations/${currentOrg?.id}`, { thresholdPercentage });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update threshold');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: "Threshold Updated",
        description: "The escalation threshold has been updated successfully.",
      });
      setShowThresholdDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update threshold",
        variant: "destructive",
      });
    },
  });

  // Alias for mutation to match the usage in the changes
  const updateStatusMutation = updateComplaintMutation;

  const handleUpdateComplaint = (id: number, status: string) => {
    updateComplaintMutation.mutate({ id, status });
  };

  const handleUpdateThreshold = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const thresholdPercentage = parseInt(formData.get("thresholdPercentage") as string);
    updateThresholdMutation.mutate(thresholdPercentage);
  };

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
      <Sidebar userRole="admin" />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-neutral-200 h-16 flex items-center px-6">
          <div className="flex items-center space-x-4">
            <Building className="text-primary" size={20} />
            <div>
              <h1 className="text-lg font-semibold text-neutral-800">Admin Dashboard</h1>
              <p className="text-xs text-neutral-500">{currentOrg?.name || 'Loading...'}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {currentOrg && (
              <Badge variant="outline">
                Threshold: {currentOrg.thresholdPercentage}%
              </Badge>
            )}
            <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2" size={14} />
                  Update Threshold
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Escalation Threshold</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateThreshold} className="space-y-4">
                  <div>
                    <Label htmlFor="threshold-percentage">Threshold Percentage</Label>
                    <Input
                      id="threshold-percentage"
                      name="thresholdPercentage"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue={currentOrg?.thresholdPercentage || 15}
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      When this percentage of similar complaints is reached, they will be escalated
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowThresholdDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateThresholdMutation.isPending}>
                      {updateThresholdMutation.isPending ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.byStatus?.find((s: any) => s.status === 'pending')?.count || 0}
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
                  {stats?.byStatus?.find((s: any) => s.status === 'resolved')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalated</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.byStatus?.find((s: any) => s.status === 'escalated')?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {groupedComplaints?.groups?.filter((g: any) => g.shouldEscalate)?.length || 0} groups need escalation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI-Summarized Complaint Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="text-primary" size={20} />
                <span>AI Complaint Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedComplaints?.groups && groupedComplaints.groups.length > 0 ? (
                <div className="space-y-6">
                  {groupedComplaints.groups.map((group: any, index: number) => (
                    <div key={group.similarityGroup} className={`border rounded-lg p-5 ${
                      group.shouldEscalate
                        ? 'border-red-200 bg-red-50'
                        : group.exceedsThreshold
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-neutral-200'
                    }`}>
                      {/* Group Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            group.shouldEscalate
                              ? 'bg-red-100 text-red-600'
                              : group.exceedsThreshold
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                          }`}>
                            {group.shouldEscalate ? (
                              <AlertTriangle size={16} />
                            ) : (
                              <Users size={16} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800 capitalize">
                              {group.similarityGroup.replace(/-/g, ' ')}
                            </h3>
                            <p className="text-sm text-neutral-500">
                              {group.count} complaints • {group.percentage}% of total
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {group.shouldEscalate && (
                            <Badge variant="destructive" className="animate-pulse">
                              REQUIRES ESCALATION
                            </Badge>
                          )}
                          {group.exceedsThreshold && !group.shouldEscalate && (
                            <Badge variant="outline" className="border-amber-500 text-amber-700">
                              Above Threshold ({currentOrg?.thresholdPercentage || 0}%)
                            </Badge>
                          )}
                          {group.aiSummary?.urgencyLevel && (
                            <Badge variant={
                              group.aiSummary.urgencyLevel === 'high' ? 'destructive' :
                              group.aiSummary.urgencyLevel === 'medium' ? 'secondary' : 'outline'
                            }>
                              {group.aiSummary.urgencyLevel.toUpperCase()} PRIORITY
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Show AI Summary for escalated groups, individual complaints for others */}
                      {group.shouldEscalate && group.aiSummary ? (
                        <div className="space-y-4">
                          {/* AI Summary Section */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 flex items-center mb-3">
                              <Brain size={16} className="mr-2" />
                              AI Analysis Summary
                            </h4>

                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-blue-800 mb-1">Executive Summary:</h5>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                  {group.aiSummary.summary}
                                </p>
                              </div>

                              <div>
                                <h5 className="font-medium text-blue-800 mb-1">Key Issues Identified:</h5>
                                <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                                  {group.aiSummary.keyIssues.map((issue: string, idx: number) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                <span className="text-sm text-blue-600">
                                  <strong>{group.aiSummary.affectedCount}</strong> employees affected
                                </span>
                                <Badge variant={
                                  group.aiSummary.urgencyLevel === 'high' ? 'destructive' :
                                  group.aiSummary.urgencyLevel === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {group.aiSummary.urgencyLevel.toUpperCase()} PRIORITY
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions for Escalated Group */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">
                              {group.count} similar complaints in this group
                            </span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye size={16} className="mr-2" />
                                View All Details
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  // Mark all as resolved
                                  group.complaints.forEach((complaint: any) => {
                                    if (complaint.status === 'escalated') {
                                      updateStatusMutation.mutate({ id: complaint.id, status: 'resolved' });
                                    }
                                  });
                                }}
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Resolve All
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Show individual complaints for non-escalated groups
                        <div className="space-y-3">
                          <h4 className="font-semibold text-neutral-800 flex items-center">
                            <FileText size={16} className="mr-2" />
                            Complaints in this group ({group.count})
                          </h4>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {group.complaints.slice(0, 5).map((complaint: any) => (
                              <div key={complaint.id} className="border border-neutral-200 rounded-lg p-4 bg-white">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className={`category-${complaint.category}`}>
                                      {complaint.category}
                                    </Badge>
                                    <Badge variant={getStatusBadgeVariant(complaint.status)}>
                                      {complaint.status}
                                    </Badge>
                                    <span className="text-xs text-neutral-500">
                                      #{complaint.id}
                                    </span>
                                  </div>
                                  <span className="text-xs text-neutral-500">
                                    {formatDate(complaint.createdAt)}
                                  </span>
                                </div>

                                <p className="text-neutral-700 mb-3 line-clamp-2">
                                  {complaint.content}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {complaint.similarityGroup && (
                                      <Badge variant="secondary" className="text-xs">
                                        Group {complaint.similarityGroup}
                                      </Badge>
                                    )}
                                    {complaint.confidence && (
                                      <span className="text-xs text-neutral-500">
                                        Confidence: {Math.round(complaint.confidence * 100)}%
                                      </span>
                                    )}
                                  </div>

                                  <Select
                                    value={complaint.status}
                                    onValueChange={(value) => updateStatusMutation.mutate({ id: complaint.id, status: value })}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="escalated">Escalated</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}

                            {group.complaints.length > 5 && (
                              <div className="text-center">
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} className="mr-2" />
                                  View {group.complaints.length - 5} more complaints
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Complaint Groups</h3>
                  <p className="text-neutral-600">
                    When employees submit complaints, AI will group and summarize them here for easier management.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Complaints (Secondary Tab) */}
          <Tabs defaultValue="groups" className="mt-6">
            <TabsList>
              <TabsTrigger value="groups">AI Grouped Analysis</TabsTrigger>
              <TabsTrigger value="individual">Individual Complaints</TabsTrigger>
            </TabsList>

            <TabsContent value="individual">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="text-primary" size={20} />
                    <span>Individual Complaints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(complaints) && complaints.length > 0 ? (
                    <div className="space-y-4">
                      {complaints.map((complaint: any) => {
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
                                    By {complaint.pseudonym} • {new Date(complaint.createdAt).toLocaleDateString()}
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

                            <p className="text-neutral-700 mb-3 line-clamp-2">
                              {complaint.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {complaint.similarityGroup && (
                                  <Badge variant="secondary" className="text-xs">
                                    Group {complaint.similarityGroup}
                                  </Badge>
                                )}
                                {complaint.confidence && (
                                  <span className="text-xs text-neutral-500">
                                    Confidence: {Math.round(complaint.confidence * 100)}%
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {complaint.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateComplaint(complaint.id, 'resolved')}
                                      disabled={updateComplaintMutation.isPending}
                                    >
                                      Mark Resolved
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleUpdateComplaint(complaint.id, 'escalated')}
                                      disabled={updateComplaintMutation.isPending}
                                    >
                                      Escalate
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">No Complaints Yet</h3>
                      <p className="text-neutral-600">
                        When employees submit complaints, they will appear here for your review.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}