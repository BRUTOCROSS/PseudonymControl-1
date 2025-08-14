import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, MessageSquare, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      await login(username, password);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const organizationAccessKey = formData.get("organizationAccessKey") as string;

    try {
      await register(username, password, organizationAccessKey || undefined);
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-800">PseudoResolve</h1>
                <p className="text-xs text-neutral-500">Anonymous Complaint Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-neutral-800 mb-4">
                Speak Up Safely with Complete Anonymity
              </h2>
              <p className="text-lg text-neutral-600">
                PseudoResolve empowers employees to voice workplace concerns anonymously, 
                ensuring your identity remains protected while fostering positive organizational change.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
                <MessageSquare className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-neutral-800">Anonymous Reporting</h3>
                  <p className="text-sm text-neutral-600">Secure & confidential</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
                <Users className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-neutral-800">AI Categorization</h3>
                  <p className="text-sm text-neutral-600">Smart complaint sorting</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
                <BarChart3 className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-neutral-800">Real-time Tracking</h3>
                  <p className="text-sm text-neutral-600">Monitor progress</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-neutral-200">
                <Shield className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-neutral-800">Threshold Escalation</h3>
                  <p className="text-sm text-neutral-600">Automated alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          name="username"
                          type="text"
                          required
                          placeholder="Enter your username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          name="password"
                          type="password"
                          required
                          placeholder="Enter your password"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          name="username"
                          type="text"
                          required
                          placeholder="Choose a username"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          You'll use this to log in securely
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          name="password"
                          type="password"
                          required
                          placeholder="Create a password"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Choose a strong password for security
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="register-org-key">Organization Access Key (Optional)</Label>
                        <Input
                          id="register-org-key"
                          name="organizationAccessKey"
                          type="text"
                          placeholder="Enter 12-character organization key"
                          className="font-mono"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Skip if you'll create or join an organization later
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-neutral-600">
            <p>&copy; 2024 PseudoResolve. Empowering anonymous workplace communication.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
