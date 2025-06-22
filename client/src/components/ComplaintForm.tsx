import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Send, Bot } from "lucide-react";

const complaintSchema = z.object({
  content: z.string().min(50, "Complaint must be at least 50 characters").max(2000, "Complaint must be less than 2000 characters"),
  category: z.enum(["hr", "infrastructure", "management", "cafeteria", "security", "other"]).optional(),
});

type ComplaintForm = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  open: boolean;
  onClose: () => void;
}

export default function ComplaintForm({ open, onClose }: ComplaintFormProps) {
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      content: "",
      category: undefined,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ComplaintForm) => {
      const response = await apiRequest("POST", "/api/complaints", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully!",
      });
      form.reset();
      setAiSuggestion(null);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });

  const content = form.watch("content");

  // Simulate AI suggestion after sufficient content
  useState(() => {
    if (content && content.length > 50 && !aiSuggestion) {
      const timeout = setTimeout(() => {
        // Mock AI suggestion based on content keywords
        let suggestion = { category: "other", similarityGroup: "general-concerns" };
        
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes("hr") || lowerContent.includes("harassment") || lowerContent.includes("salary")) {
          suggestion = { category: "hr", similarityGroup: "workplace-culture" };
        } else if (lowerContent.includes("computer") || lowerContent.includes("equipment") || lowerContent.includes("building")) {
          suggestion = { category: "infrastructure", similarityGroup: "office-equipment" };
        } else if (lowerContent.includes("food") || lowerContent.includes("cafeteria") || lowerContent.includes("lunch")) {
          suggestion = { category: "cafeteria", similarityGroup: "food-quality" };
        } else if (lowerContent.includes("security") || lowerContent.includes("safety") || lowerContent.includes("access")) {
          suggestion = { category: "security", similarityGroup: "access-control" };
        } else if (lowerContent.includes("management") || lowerContent.includes("manager") || lowerContent.includes("decision")) {
          suggestion = { category: "management", similarityGroup: "leadership-issues" };
        }
        
        setAiSuggestion(suggestion);
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [content, aiSuggestion]);

  const onSubmit = (data: ComplaintForm) => {
    submitMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="text-primary" size={20} />
            <span>Submit Anonymous Complaint</span>
          </DialogTitle>
          <p className="text-sm text-neutral-600">
            Your identity will remain completely anonymous. All complaints are processed securely.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category (AI will suggest)" />
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
                  <p className="text-xs text-neutral-500">
                    Our AI will automatically categorize your complaint if you don't select one.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe Your Complaint</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder="Please provide detailed information about your complaint. The more specific you are, the better we can help resolve the issue."
                      className="resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-500">Minimum 50 characters required</p>
                    <span className="text-xs text-neutral-500">{content?.length || 0}/2000</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {aiSuggestion && (
              <Alert className="border-blue-200 bg-blue-50">
                <Bot className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-blue-800">AI Analysis</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Suggested Category:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {aiSuggestion.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Similarity Group:</span>
                      <span className="text-xs text-blue-600">{aiSuggestion.similarityGroup}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-amber-200 bg-amber-50">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-amber-800">Privacy Notice</span>
                </div>
                <p className="text-xs text-amber-700">
                  Your complaint is completely anonymous. We use advanced encryption and your assigned pseudonym to protect your identity while ensuring your concerns are heard.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="mr-2" size={16} />
                )}
                Submit Complaint
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
