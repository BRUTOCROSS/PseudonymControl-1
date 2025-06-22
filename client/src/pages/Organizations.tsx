import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Building, Users, Key, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Organizations() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [] } = useQuery({
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
        description: `Share this access key with your team: ${data.accessKey}`,
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
        description: "You can now submit and manage complaints.",
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

    createOrgMutation.mutate({ name, description: description || undefined });
  };

  const handleJoinOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const accessKey = formData.get("accessKey") as string;

    joinOrgMutation.mutate(accessKey);
  };

  const copyAccessKey = (accessKey: string) => {
    navigator.clipboard.writeText(accessKey);
    setCopiedKey(accessKey);
    toast({
      title: "Copied",
      description: "Access key copied to clipboard",
    });
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const currentOrg = organizations.find((org: any) => org.id === user?.organizationId);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="lg:ml-64">
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Organizations</h1>
            <p className="text-neutral-600">
              Create or join an organization to start managing workplace complaints anonymously.
            </p>
          </div>

          {/* Call-to-Action for non-members */}
          {!user?.organizationId && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
              <div className="text-center">
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Get Started</h3>
                <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                  You need to be part of an organization to submit complaints and access the system. Create a new organization or join an existing one.
                </p>
                <div className="flex justify-center space-x-4">
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button size="lg">
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

                  <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg">
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
                          <Label htmlFor="join-accessKey">Access Key</Label>
                          <Input
                            id="join-accessKey"
                            name="accessKey"
                            required
                            placeholder="Enter 12-character access key"
                            className="font-mono"
                          />
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
                </div>
              </div>
            </div>
          )}

          {/* Current Organization */}
          {currentOrg && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="text-primary" size={20} />
                  <span>Current Organization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">{currentOrg.name}</h3>
                    {currentOrg.description && (
                      <p className="text-neutral-600 mt-1">{currentOrg.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary">
                        Threshold: {currentOrg.thresholdPercentage}%
                      </Badge>
                      {user?.isAdmin && (
                        <Badge variant="outline">Administrator</Badge>
                      )}
                    </div>
                  </div>
                  
                  {user?.isAdmin && (
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 mb-2">Access Key:</p>
                      <div className="flex items-center space-x-2">
                        <code className="bg-neutral-100 px-2 py-1 rounded text-sm">
                          {currentOrg.accessKey}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAccessKey(currentOrg.accessKey)}
                        >
                          {copiedKey === currentOrg.accessKey ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Share this key with employees to join
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Actions */}
          {!currentOrg && (
            <Tabs defaultValue="join" className="mb-8">
              <TabsList>
                <TabsTrigger value="join">Join Organization</TabsTrigger>
                <TabsTrigger value="create">Create Organization</TabsTrigger>
              </TabsList>

              <TabsContent value="join">
                <Card>
                  <CardHeader>
                    <CardTitle>Join an Organization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJoinOrg} className="space-y-4">
                      <div>
                        <Label htmlFor="accessKey">Organization Access Key</Label>
                        <Input
                          id="accessKey"
                          name="accessKey"
                          type="text"
                          required
                          placeholder="Enter the access key provided by your organization"
                        />
                      </div>
                      <Button type="submit" disabled={joinOrgMutation.isPending}>
                        {joinOrgMutation.isPending ? "Joining..." : "Join Organization"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Organization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateOrg} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Brief description of your organization"
                          rows={3}
                        />
                      </div>
                      <Button type="submit" disabled={createOrgMutation.isPending}>
                        {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* All Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>All Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org: any) => (
                  <Card key={org.id} className="border border-neutral-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-neutral-800">{org.name}</h3>
                          {org.description && (
                            <p className="text-sm text-neutral-600 mt-1">{org.description}</p>
                          )}
                        </div>
                        {org.id === user?.organizationId && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>Members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Key size={14} />
                          <span>Threshold: {org.thresholdPercentage}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {organizations.length === 0 && (
                  <div className="col-span-full text-center py-8 text-neutral-500">
                    No organizations found. Create one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
