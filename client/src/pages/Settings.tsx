import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  Building, 
  Key, 
  Copy,
  Settings as SettingsIcon,
  Bell,
  Lock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [] } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const currentOrg = organizations.find((org: any) => org.id === user?.organizationId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const markAllNotificationsRead = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n: any) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((notification: any) =>
          apiRequest("PATCH", `/api/notifications/${notification.id}/read`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="lg:ml-64">
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Settings</h1>
            <p className="text-neutral-600">
              Manage your account settings, privacy preferences, and organization details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="text-primary" size={20} />
                  <span>User Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-neutral-700">Username</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input value={user.username} disabled className="bg-neutral-50" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.username, "Username")}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your username cannot be changed
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-neutral-700">Anonymous Pseudonym</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input value={user.pseudonym} disabled className="bg-neutral-50" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.pseudonym, "Pseudonym")}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    This is your anonymous identity for complaints
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-neutral-700">Role</Label>
                  <div className="mt-1">
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? "Administrator" : "Employee"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="text-primary" size={20} />
                  <span>Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-green-800">
                      Anonymous Protection Active
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    Your complaints are completely anonymous. Only your pseudonym is visible to administrators.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-neutral-500">
                        Receive updates about your complaints
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">
                        Anonymous Analytics
                      </Label>
                      <p className="text-xs text-neutral-500">
                        Help improve the platform anonymously
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Details */}
            {currentOrg && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="text-primary" size={20} />
                    <span>Organization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-neutral-700">Organization Name</Label>
                    <div className="mt-1">
                      <Input value={currentOrg.name} disabled className="bg-neutral-50" />
                    </div>
                  </div>

                  {currentOrg.description && (
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">Description</Label>
                      <div className="mt-1">
                        <Input value={currentOrg.description} disabled className="bg-neutral-50" />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-neutral-700">Escalation Threshold</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="outline">{currentOrg.thresholdPercentage}%</Badge>
                      <span className="text-xs text-neutral-500">
                        Complaints escalate when this threshold is reached
                      </span>
                    </div>
                  </div>

                  {user.isAdmin && (
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">Access Key</Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Input value={currentOrg.accessKey} disabled className="bg-neutral-50 font-mono text-sm" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(currentOrg.accessKey, "Access key")}
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Share this key with employees to join your organization
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="text-primary" size={20} />
                    <span>Notifications</span>
                  </div>
                  {notifications.filter((n: any) => !n.isRead).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllNotificationsRead.mutate()}
                      disabled={markAllNotificationsRead.isPending}
                    >
                      Mark all as read
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead 
                          ? 'bg-neutral-50 border-neutral-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-800">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-neutral-500">
                      <Bell className="mx-auto mb-2 text-neutral-400" size={24} />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="text-primary" size={20} />
                  <span>Account Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="mr-2" size={16} />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2" size={16} />
                    Download My Data
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Lock className="mr-2" size={16} />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to sign out? You'll need to log in again to access your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
