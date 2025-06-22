import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Star } from "lucide-react";

interface Complaint {
  id: number;
  content: string;
  category: string;
  status: 'pending' | 'resolved' | 'escalated';
  similarityGroup?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintCardProps {
  complaint: Complaint;
  onView?: (complaint: Complaint) => void;
  showActions?: boolean;
}

const categoryColors = {
  hr: "bg-purple-100 text-purple-800",
  infrastructure: "bg-blue-100 text-blue-800", 
  management: "bg-green-100 text-green-800",
  cafeteria: "bg-orange-100 text-orange-800",
  security: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-800",
};

export default function ComplaintCard({ complaint, onView, showActions = true }: ComplaintCardProps) {
  const categoryClass = categoryColors[complaint.category as keyof typeof categoryColors] || categoryColors.other;
  const statusClass = statusColors[complaint.status];

  return (
    <Card className="hover:bg-neutral-50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Badge className={categoryClass}>
            {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
          </Badge>
          <Badge className={statusClass}>
            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
          </Badge>
          <span className="text-xs text-neutral-500">#{complaint.id}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-neutral-800 mb-3 line-clamp-3">
          {complaint.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-neutral-500">
            <span>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</span>
            {complaint.similarityGroup && (
              <span>{complaint.similarityGroup.replace(/-/g, ' ')}</span>
            )}
            {complaint.status === 'resolved' && (
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400" size={12} />
                <span>Rate feedback</span>
              </div>
            )}
          </div>
          
          {showActions && onView && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView(complaint)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
