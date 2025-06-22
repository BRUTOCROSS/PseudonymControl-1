import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth, authService } from "@/lib/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Join organization form schema
const joinOrgSchema = z.object({
  accessKey: z.string().min(5, "Access key must be at least 5 characters"),
});

export default function JoinOrganization() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof joinOrgSchema>>({
    resolver: zodResolver(joinOrgSchema),
    defaultValues: {
      accessKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof joinOrgSchema>) => {
    if (!user) {
      setError("You must be logged in to join an organization");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, verify the organization exists
      const orgResponse = await fetch(`/api/organizations/access/${values.accessKey}`, {
        credentials: 'include',
      });

      if (!orgResponse.ok) {
        setError("Invalid organization access key");
        setIsLoading(false);
        return;
      }

      const organization = await orgResponse.json();

      // Update the user's organization
      const updateResponse = await apiRequest('PATCH', `/api/users/${user.id}`, {
        organizationId: organization.id
      });

      if (updateResponse.ok) {
        toast({
          title: "Successfully joined organization",
          description: `You have joined ${organization.name}`,
        });
        
        // Invalidate and refetch queries that depend on user data
        await queryClient.invalidateQueries({
          queryKey: ['/api/auth/user']
        });

        // Now make sure to update our user state in the auth service
        await authService.updateUser();
        
        // Use navigate instead of hard redirect to avoid session issues
        navigate("/dashboard");
      } else {
        setError("Failed to join organization");
      }
    } catch (error) {
      setError("An error occurred while joining the organization");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                You need to be logged in to join an organization.{" "}
                <Link href="/login">
                  <a className="text-primary font-medium hover:underline">Login</a>
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Join Organization</CardTitle>
          <CardDescription className="text-center">
            Enter your organization's access key to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accessKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Access Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization access key" {...field} />
                    </FormControl>
                    <p className="text-xs text-neutral-500 mt-1">
                      This key should have been provided by your organization administrator
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Organization"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-neutral-600">
            Don't have an access key?{" "}
            <Link href="/dashboard">
              <a className="text-primary font-medium hover:underline">Back to Dashboard</a>
            </Link>
          </div>
          <div className="text-sm text-center text-neutral-600">
            Need to create an organization?{" "}
            <Link href="/register-organization">
              <a className="text-primary font-medium hover:underline">Create Organization</a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}