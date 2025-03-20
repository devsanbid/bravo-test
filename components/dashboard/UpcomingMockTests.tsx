"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth_store";
import { getUpcomingMockTests } from "@/controllers/MockTestController";
import { MockTest } from "@/lib/types/mock-test";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, FileText, Headphones, PenTool, Mic } from "lucide-react";

export default function UpcomingMockTests() {
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchUpcomingTests();
  }, []);

  const fetchUpcomingTests = async () => {
    try {
      setLoading(true);
      const tests = await getUpcomingMockTests();
      setMockTests(tests as MockTest[]);
    } catch (error) {
      console.error("Error fetching upcoming mock tests:", error);
      toast.error("Failed to load upcoming tests");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reading":
        return <FileText className="h-5 w-5" />;
      case "listening":
        return <Headphones className="h-5 w-5" />;
      case "writing":
        return <PenTool className="h-5 w-5" />;
      case "speaking":
        return <Mic className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeRemaining = (dateString: string) => {
    const now = new Date();
    const scheduledDate = new Date(dateString);
    const diffMs = scheduledDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Starting now";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Mock Tests</CardTitle>
          <CardDescription>
            Prepare for these upcoming tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading upcoming tests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mockTests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Mock Tests</CardTitle>
          <CardDescription>
            Prepare for these upcoming tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming tests scheduled.</p>
            <p className="text-sm mt-2">Check back later for new test schedules.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Mock Tests</CardTitle>
        <CardDescription>
          Prepare for these upcoming tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTests.map((test) => (
            <Card key={test.id} className="overflow-hidden">
              <div className="flex border-l-4 border-l-blue-500">
                <div className="p-4 flex items-center justify-center bg-blue-50 w-16">
                  {getCategoryIcon(test.category)}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{test.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                    </div>
                    <Badge className="capitalize bg-blue-500">{test.category}</Badge>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    {test.scheduledDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(test.scheduledDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{test.duration} minutes</span>
                    </div>
                    {test.scheduledDate && (
                      <div className="flex items-center text-sm font-medium text-orange-600">
                        <span>Starts in: {getTimeRemaining(test.scheduledDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
              <CardFooter className="bg-gray-50 px-4 py-2 flex justify-between">
                <div>
                  <span className="text-sm font-medium">Total Marks: {test.totalMarks}</span>
                </div>
                <Button 
                  size="sm"
                  onClick={() => router.push(`/dashboard/mock-tests/${test.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t px-6 py-3">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push("/dashboard/mock-tests")}
        >
          View All Tests
        </Button>
      </CardFooter>
    </Card>
  );
}
