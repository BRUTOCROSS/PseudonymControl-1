import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Building, Key, Users, ArrowRight, Shield } from "lucide-react";

export default function OrganizationSetup() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
  });

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/organizations", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Successfully Joined!",
        description: "You can now access the dashboard and submit complaints.",
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

  const handleCreateOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    createOrgMutation.mutate({
      name,
      description: description || undefined,
    });
  };

  const handleJoinOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const accessKey = formData.get("accessKey") as string;

    joinOrgMutation.mutate(accessKey);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">PseudoResolve</h1>
              <p className="text-sm text-neutral-500">Anonymous Complaint Management</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Welcome, {user?.pseudonym}!
            </h2>
            <p className="text-neutral-600">
              To get started with submitting and managing workplace complaints, you need to be part of an organization.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Organization Options */}
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
                Start a new organization and get an access key to share with your team.
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
                Join an existing organization using the access key provided by an administrator.
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

          {/* My Organizations */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="text-purple-600" size={24} />
              </div>
              <CardTitle className="text-lg">My Organizations</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-neutral-600 mb-4">
                View and manage organizations you've created or joined.
              </p>
              {Array.isArray(organizations) && organizations.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {organizations.slice(0, 2).map((org: any) => (
                    <div key={org.id} className="text-left p-2 bg-neutral-50 rounded text-sm">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-neutral-500">{org.description || 'No description'}</p>
                    </div>
                  ))}
                  {organizations.length > 2 && (
                    <p className="text-xs text-neutral-500">+{organizations.length - 2} more...</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 mb-4">No organizations yet</p>
              )}
              <Button variant="outline" size="lg" className="w-full" disabled={!Array.isArray(organizations) || organizations.length === 0}>
                <Users className="mr-2" size={16} />
                View All ({Array.isArray(organizations) ? organizations.length : 0})
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Continue Prompt */}
        {user?.organizationId && (
          <div className="text-center">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <ArrowRight className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold">You're all set!</p>
                    <p className="text-green-600 text-sm">You can now access the dashboard to start managing complaints.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}