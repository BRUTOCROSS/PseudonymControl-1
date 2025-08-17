import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building, 
  Check, 
  Copy, 
  Plus, 
  Users, 
  Key,
  Settings,
  Crown,
  Shield,
  ArrowRight,
  UserCheck
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Organizations() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
  });

  const { data: userOrganizations = [] } = useQuery<any[]>({
    queryKey: ["/api/user/organizations"],
  });

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; thresholdPercentage?: number }) => {
      const response = await apiRequest("POST", "/api/organizations", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Organization Created!",
        description: `Your organization has been created. Access key: ${data.accessKey}`,
      });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      });
    },
  });

  const joinOrgMutation = useMutation({
    mutationFn: async (accessKey: string) => {
      const response = await apiRequest("POST", "/api/organizations/join", { accessKey });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join organization');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Successfully Joined!",
        description: "You have joined the organization successfully.",
      });
      setShowJoinDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join organization",
        variant: "destructive",
      });
    },
  });

  const switchOrganizationMutation = useMutation({
    mutationFn: async (organizationId: number) => {
      const response = await apiRequest("POST", "/api/organizations/switch", { organizationId });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to switch organization');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Organization Switched",
        description: "You can now access the dashboard for this organization.",
      });
      // Navigate to dashboard
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to switch organization",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const thresholdPercentage = parseInt(formData.get("thresholdPercentage") as string) || 15;

    createOrgMutation.mutate({
      name,
      description: description || undefined,
      thresholdPercentage,
    });
  };

  const handleJoinOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const accessKey = formData.get("accessKey") as string;

    joinOrgMutation.mutate(accessKey);
  };

  const handleSwitchOrganization = (organizationId: number) => {
    switchOrganizationMutation.mutate(organizationId);
  };

  const copyAccessKey = (accessKey: string) => {
    navigator.clipboard.writeText(accessKey);
    setCopiedKey(accessKey);
    toast({
      title: "Copied!",
      description: "Access key copied to clipboard",
    });
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const getUserRoleInOrganization = (org: any) => {
    // Get role from the user-organization relationship data
    return org.role || 'member';
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-neutral-200 h-16 flex items-center px-6">
          <div className="flex items-center space-x-4">
            <Building className="text-primary" size={20} />
            <div>
              <h1 className="text-lg font-semibold text-neutral-800">Organizations</h1>
              <p className="text-xs text-neutral-500">Manage your organization memberships</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Organization Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Create Organization */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-blue-600" size={24} />
                </div>
                <CardTitle className="text-lg">Create Organization</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-neutral-600 mb-4">
                  Start a new organization and become its administrator.
                </p>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <Plus className="mr-2" size={16} />
                      Create Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrg} className="space-y-4">
                      <div>
                        <Label htmlFor="create-name">Organization Name</Label>
                        <Input
                          id="create-name"
                          name="name"
                          required
                          placeholder="e.g., TechCorp Inc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="create-description">Description (Optional)</Label>
                        <Textarea
                          id="create-description"
                          name="description"
                          placeholder="Brief description of your organization"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="create-threshold">Threshold Percentage</Label>
                        <Input
                          id="create-threshold"
                          name="thresholdPercentage"
                          type="number"
                          min="1"
                          max="100"
                          defaultValue="15"
                          required
                          placeholder="15"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          When this percentage of similar complaints is reached, they will be escalated
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createOrgMutation.isPending}>
                          {createOrgMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Join Organization */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="text-green-600" size={24} />
                </div>
                <CardTitle className="text-lg">Join Organization</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-neutral-600 mb-4">
                  Join an existing organization using an access key.
                </p>
                <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full">
                      <Key className="mr-2" size={16} />
                      Join Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleJoinOrg} className="space-y-4">
                      <div>
                        <Label htmlFor="join-accessKey">Organization Access Key</Label>
                        <Input
                          id="join-accessKey"
                          name="accessKey"
                          required
                          placeholder="Enter the 12-character organization key"
                          className="font-mono"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Ask your organization administrator for the access key
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowJoinDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={joinOrgMutation.isPending}>
                          {joinOrgMutation.isPending ? "Joining..." : "Join"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* My Organizations Summary */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="text-purple-600" size={24} />
                </div>
                <CardTitle className="text-lg">My Organizations</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-neutral-600 mb-4">
                  You are a member of {Array.isArray(userOrganizations) ? userOrganizations.length : 0} organization(s).
                </p>
                <div className="text-2xl font-bold text-primary mb-4">
                  {Array.isArray(userOrganizations) ? userOrganizations.length : 0}
                </div>
                <p className="text-sm text-neutral-500">
                  View details and switch between organizations below
                </p>
              </CardContent>
            </Card>
          </div>

          {/* My Organizations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="text-primary" size={20} />
                <span>My Organizations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(userOrganizations) && userOrganizations.length > 0 ? (
                <div className="space-y-4">
                  {userOrganizations.map((org: any) => {
                    const userRole = getUserRoleInOrganization(org);
                    const isCurrentOrg = user?.organizationId === org.id;
                    
                    return (
                      <div key={org.id} className={`border rounded-lg p-4 ${isCurrentOrg ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <Building className="text-neutral-600" size={20} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-neutral-800 flex items-center space-x-2">
                                <span>{org.name}</span>
                                {isCurrentOrg && (
                                  <Badge variant="default" className="text-xs">Current</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-neutral-600">
                                {org.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="mb-2">
                                {userRole === 'admin' ? (
                                  <>
                                    <Crown className="mr-1" size={12} />
                                    Administrator
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-1" size={12} />
                                    Member
                                  </>
                                )}
                              </Badge>
                              {userRole === 'admin' && (
                                <div className="text-xs text-neutral-500">
                                  Threshold: {org.thresholdPercentage}%
                                </div>
                              )}
                            </div>
                            
                            {!isCurrentOrg && (
                              <Button
                                onClick={() => handleSwitchOrganization(org.id)}
                                disabled={switchOrganizationMutation.isPending}
                                size="sm"
                              >
                                <ArrowRight className="mr-1" size={14} />
                                Switch
                              </Button>
                            )}
                          </div>
                        </div>

                        {userRole === 'admin' && (
                          <div className="border-t border-neutral-200 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-neutral-600">Access Key:</span>
                              <div className="flex items-center space-x-2">
                                <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">
                                  {org.accessKey}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyAccessKey(org.accessKey)}
                                >
                                  {copiedKey === org.accessKey ? (
                                    <Check size={16} className="text-green-600" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Organizations Yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Create a new organization or join an existing one to get started.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                      <Plus className="mr-2" size={16} />
                      Create Organization
                    </Button>
                    <Button onClick={() => setShowJoinDialog(true)} variant="outline">
                      <Key className="mr-2" size={16} />
                      Join Organization
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}