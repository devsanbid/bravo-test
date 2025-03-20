"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth_store";
import { getStudentAttemptsByUserId } from "@/controllers/MockTestController";
import { StudentAttempt } from "@/lib/types/mock-test";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileText, Headphones, PenTool, Mic, TrendingUp } from "lucide-react";
import { UserDataInterface } from "@/lib/type";

export default function MockTestProgress() {
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser } = useAuthStore();
  const [user, setUser] = useState<null | UserDataInterface>(null);

  useEffect(() => {
    async function run() {
      const user = await getCurrentUser();
      if (user) {
        setUser(user)
        fetchAttempts();
      }
    }
  }, [getCurrentUser]);

  const fetchAttempts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userAttempts = await getStudentAttemptsByUserId(user.userId);
      setAttempts(userAttempts as StudentAttempt[]);
    } catch (error) {
      console.error("Error fetching student attempts:", error);
      toast.error("Failed to load test progress");
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
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  // Calculate progress for each category
  const calculateProgress = () => {
    const categories = ["reading", "listening", "writing", "speaking"];
    const progress: Record<string, { completed: number; score: number; average: number }> = {};
    
    // Initialize progress for each category
    categories.forEach(category => {
      progress[category] = { completed: 0, score: 0, average: 0 };
    });
    
    // Add overall progress
    progress["overall"] = { completed: 0, score: 0, average: 0 };
    
    // Count completed tests and calculate scores
    attempts.forEach(attempt => {
      if (attempt.status === "completed" && attempt.percentageScore !== undefined) {
        const mockTest = attempt.mockTest as any; // This would be populated in a real app
        if (mockTest && mockTest.category) {
          const category = mockTest.category;
          progress[category].completed += 1;
          progress[category].score += attempt.percentageScore;
          progress["overall"].completed += 1;
          progress["overall"].score += attempt.percentageScore;
        }
      }
    });
    
    // Calculate averages
    categories.forEach(category => {
      if (progress[category].completed > 0) {
        progress[category].average = Math.round(progress[category].score / progress[category].completed);
      }
    });
    
    if (progress["overall"].completed > 0) {
      progress["overall"].average = Math.round(progress["overall"].score / progress["overall"].completed);
    }
    
    return progress;
  };

  const progress = calculateProgress();

  const getProgressLevel = (average: number) => {
    if (average >= 90) return "Expert";
    if (average >= 75) return "Advanced";
    if (average >= 60) return "Intermediate";
    return "Beginner";
  };

  const getProgressColor = (average: number) => {
    if (average >= 90) return "bg-green-500";
    if (average >= 75) return "bg-blue-500";
    if (average >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            Track your performance in mock tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading progress data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>
          Track your performance in mock tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="listening">Listening</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
          </TabsList>
          
          {["overall", "reading", "listening", "writing", "speaking"].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-100">
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{category} Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      {progress[category].completed} test{progress[category].completed !== 1 ? 's' : ''} completed
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-sm font-medium">{progress[category].average}%</span>
                  </div>
                  <Progress 
                    value={progress[category].average} 
                    className="h-2"
                    indicatorclassname={getProgressColor(progress[category].average)}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Current Level</h4>
                      <p className="text-sm text-muted-foreground">Based on your test scores</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{getProgressLevel(progress[category].average)}</span>
                      <p className="text-sm text-muted-foreground">
                        {progress[category].average >= 90 
                          ? "Excellent work!" 
                          : progress[category].average >= 75 
                          ? "Great progress!" 
                          : progress[category].average >= 60 
                          ? "Good effort!" 
                          : "Keep practicing!"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {progress[category].completed === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No {category} tests completed yet.</p>
                    <p className="text-sm mt-1">Complete tests to see your progress.</p>
                  </div>
                )}
                
                {category !== "overall" && progress[category].completed > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium">Improvement Areas</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {category === "reading" && (
                        <>
                          <li>Practice skimming and scanning techniques</li>
                          <li>Work on vocabulary building</li>
                          <li>Improve comprehension of complex texts</li>
                        </>
                      )}
                      {category === "listening" && (
                        <>
                          <li>Practice note-taking during audio playback</li>
                          <li>Work on understanding different accents</li>
                          <li>Improve focus during longer audio segments</li>
                        </>
                      )}
                      {category === "writing" && (
                        <>
                          <li>Practice essay structure and organization</li>
                          <li>Work on grammar and vocabulary usage</li>
                          <li>Improve coherence and cohesion in writing</li>
                        </>
                      )}
                      {category === "speaking" && (
                        <>
                          <li>Practice fluency and pronunciation</li>
                          <li>Work on organizing responses clearly</li>
                          <li>Improve vocabulary for speaking tasks</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
