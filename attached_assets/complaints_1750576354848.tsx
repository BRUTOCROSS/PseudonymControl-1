import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Redirect } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitComplaintSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function Complaints() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: complaints = [], isLoading: isLoadingComplaints } = useQuery({
    queryKey: ['/api/complaints'],
    enabled: isAuthenticated && !!user?.organizationId,
  });

  const { data: myComplaints = [], isLoading: isLoadingMyComplaints } = useQuery({
    queryKey: ['/api/complaints/user'],
    enabled: isAuthenticated,
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (values: z.infer<typeof submitComplaintSchema>) => {
      const response = await apiRequest('POST', '/api/complaints', values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit complaint');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
      queryClient.invalidateQueries({ queryKey: ['/api/complaints/user'] });
      setCreateDialogOpen(false);
      toast({
        title: "Complaint submitted",
        description: "Your complaint has been submitted anonymously.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit complaint",
        description: error.message || "An error occurred while submitting your complaint.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<z.infer<typeof submitComplaintSchema>>({
    resolver: zodResolver(submitComplaintSchema),
    defaultValues: {
      content: "",
      category: "infrastructure"
    },
  });

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case "escalated":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Escalated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Function to get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "hr":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">HR</Badge>;
      case "infrastructure":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Infrastructure</Badge>;
      case "management":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">Management</Badge>;
      case "cafeteria":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Cafeteria</Badge>;
      case "security":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Security</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Other</Badge>;
    }
  };

  // Submit handler for the complaint form
  const onSubmit = (values: z.infer<typeof submitComplaintSchema>) => {
    createComplaintMutation.mutate(values);
  };

  // If auth is loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If user has no organization, redirect to join organization page
  if (!user?.organizationId) {
    return <Redirect to="/join-organization" />;
  }

  return (
    <div className="relative min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} userRole={user?.isAdmin ? "admin" : "user"} />
      
      <div className="pt-16 min-h-screen flex">
        <Sidebar userRole={user?.isAdmin ? "admin" : "user"} />
        
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-800">Complaints</h1>
              <p className="text-neutral-500 text-sm">View and manage complaints</p>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Submit New Complaint</DialogTitle>
                  <DialogDescription>
                    Your identity will remain anonymous when submitting this complaint
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                              <SelectItem value="cafeteria">Cafeteria</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complaint Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your complaint in detail..."
                              className="resize-none min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createComplaintMutation.isPending}
                      >
                        {createComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Complaints</TabsTrigger>
              <TabsTrigger value="my">My Complaints</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="escalated">Escalated</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoadingComplaints ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((complaint: any) => (
                    <Card key={complaint.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-2 items-center">
                            {getStatusBadge(complaint.status)}
                            {getCategoryBadge(complaint.category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{complaint.content}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Anonymous User
                          </div>
                          {user?.isAdmin && complaint.status !== 'resolved' && (
                            <Button variant="outline" size="sm">
                              Mark as Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-neutral-900">No complaints</h3>
                      <p className="mt-1 text-sm text-neutral-500">Get started by creating a new complaint.</p>
                      <div className="mt-6">
                        <Button onClick={() => setCreateDialogOpen(true)}>
                          New Complaint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="my">
              {isLoadingMyComplaints ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : myComplaints.length > 0 ? (
                <div className="space-y-4">
                  {myComplaints.map((complaint: any) => (
                    <Card key={complaint.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-2 items-center">
                            {getStatusBadge(complaint.status)}
                            {getCategoryBadge(complaint.category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{complaint.content}</p>
                        
                        {complaint.status === 'resolved' && (
                          <div className="mt-4">
                            <Button variant="outline" size="sm">
                              Provide Feedback
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-neutral-900">No complaints submitted</h3>
                      <p className="mt-1 text-sm text-neutral-500">You haven't submitted any complaints yet.</p>
                      <div className="mt-6">
                        <Button onClick={() => setCreateDialogOpen(true)}>
                          Submit Complaint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="space-y-4">
                {complaints
                  .filter((c: any) => c.status === 'pending')
                  .map((complaint: any) => (
                    <Card key={complaint.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-2 items-center">
                            {getStatusBadge(complaint.status)}
                            {getCategoryBadge(complaint.category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{complaint.content}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Anonymous User
                          </div>
                          {user?.isAdmin && (
                            <Button variant="outline" size="sm">
                              Mark as Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                {!isLoadingComplaints && complaints.filter((c: any) => c.status === 'pending').length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-neutral-900">No pending complaints</h3>
                        <p className="mt-1 text-sm text-neutral-500">There are no pending complaints at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="escalated">
              <div className="space-y-4">
                {complaints
                  .filter((c: any) => c.status === 'escalated')
                  .map((complaint: any) => (
                    <Card key={complaint.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-2 items-center">
                            {getStatusBadge(complaint.status)}
                            {getCategoryBadge(complaint.category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{complaint.content}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Anonymous User
                          </div>
                          
                          <div className="flex items-center text-sm text-orange-600">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Escalated due to threshold
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                {!isLoadingComplaints && complaints.filter((c: any) => c.status === 'escalated').length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-neutral-900">No escalated complaints</h3>
                        <p className="mt-1 text-sm text-neutral-500">There are no escalated complaints at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="resolved">
              <div className="space-y-4">
                {complaints
                  .filter((c: any) => c.status === 'resolved')
                  .map((complaint: any) => (
                    <Card key={complaint.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-2 items-center">
                            {getStatusBadge(complaint.status)}
                            {getCategoryBadge(complaint.category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{complaint.content}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-neutral-500">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Anonymous User
                          </div>
                          
                          <div className="flex items-center text-sm text-green-600">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Resolved on {new Date(complaint.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                {!isLoadingComplaints && complaints.filter((c: any) => c.status === 'resolved').length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-neutral-900">No resolved complaints</h3>
                        <p className="mt-1 text-sm text-neutral-500">There are no resolved complaints at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}