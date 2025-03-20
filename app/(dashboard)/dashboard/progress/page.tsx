"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth_store";
import { getStudentAttemptsByUserId, getMockTestById } from "@/controllers/MockTestController";
import type { StudentAttempt } from "@/lib/types/mock-test";
import type { UserDataInterface } from "@/lib/type";

interface AttemptWithMockTest extends StudentAttempt {
  mockTestName: string;
  mockTestCategory: string;
}

const COLORS = ["#4ade80", "#f97316", "#6b7280"];

export default function ProgressPage() {
  const [user, setUser] = useState<UserDataInterface | null>(null)
  const {getCurrentUser} = useAuthStore();
  const [attempts, setAttempts] = useState<AttemptWithMockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockTestScores, setMockTestScores] = useState<any[]>([]);
  const [studyHours, setStudyHours] = useState<any[]>([]);
  const [materialProgress, setMaterialProgress] = useState<any[]>([]);
  const [skillScores, setSkillScores] = useState({
    reading: { score: 0, percentage: 0 },
    listening: { score: 0, percentage: 0 },
    writing: { score: 0, percentage: 0 },
    speaking: { score: 0, percentage: 0 },
  });
  const [stats, setStats] = useState({
    averageScore: "0.0",
    studyHours: 0,
    materialsCompleted: 0,
    mockTestsTaken: 0,
  });

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
          const user = await getCurrentUser()
        if(user) {
          setUser(user)
        }
        
        // Make sure user is defined and has an id before proceeding
        if (user && user.userId) {
          const studentId = user.userId;

          // Fetch attempts only if studentId is defined
          if (studentId) {
            const attemptsData = await getStudentAttemptsByUserId(studentId);

            // Process attempts only if we got data back
            if (attemptsData && attemptsData.length > 0) {
              const attemptsWithMockTest: AttemptWithMockTest[] = await Promise.all(
                attemptsData.map(async (attempt) => {
                  const mockTest = await getMockTestById(attempt.mockTestId);
                  return {
                    id: attempt.$id,
                    userId: attempt.userId,
                    mockTestId: attempt.mockTestId,
                    startedAt: attempt.startedAt,
                    completedAt: attempt.completedAt,
                    status: attempt.status,
                    totalScore: attempt.totalScore,
                    percentageScore: attempt.percentageScore,
                    mockTestName: mockTest.name,
                    mockTestCategory: mockTest.category
                  }
                })
              );
              setAttempts(attemptsWithMockTest);
              processAttemptData(attemptsWithMockTest);
            } else {
              // If no attempts found, set empty array and initialize with default data
              setAttempts([]);
              setMockTestScores([]);
              setStudyHours([
                { day: "Mon", hours: 0 },
                { day: "Tue", hours: 0 },
                { day: "Wed", hours: 0 },
                { day: "Thu", hours: 0 },
                { day: "Fri", hours: 0 },
                { day: "Sat", hours: 0 },
                { day: "Sun", hours: 0 }
              ]);
              setMaterialProgress([
                { name: "Completed", value: 0 },
                { name: "In Progress", value: 0 },
                { name: "Not Started", value: 100 }
              ]);
            }
          }
        } else {
          // If no user, set empty array for attempts and initialize with default data
          setAttempts([]);
          setMockTestScores([]);
          setStudyHours([
            { day: "Mon", hours: 0 },
            { day: "Tue", hours: 0 },
            { day: "Wed", hours: 0 },
            { day: "Thu", hours: 0 },
            { day: "Fri", hours: 0 },
            { day: "Sat", hours: 0 },
            { day: "Sun", hours: 0 }
          ]);
          setMaterialProgress([
            { name: "Completed", value: 0 },
            { name: "In Progress", value: 0 },
            { name: "Not Started", value: 100 }
          ]);
        }
      } catch (error: any) {
        console.error("Error fetching attempts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const processAttemptData = (attempts: AttemptWithMockTest[]) => {
    if (!attempts || attempts.length === 0) return;

    // Sort attempts by date
    const sortedAttempts = [...attempts].sort((a, b) => {
      return new Date(a.completedAt || a.startedAt).getTime() - new Date(b.completedAt || b.startedAt).getTime();
    });

    console.log("sortedAttempts: ", sortedAttempts)

    // Process mock test scores for line chart
    const mockScores = processTestScores(sortedAttempts);
    setMockTestScores(mockScores);

    // Process study hours (simulated based on attempt data)
    const hours = processStudyHours(sortedAttempts);
    setStudyHours(hours);

    // Process material progress
    const progress = processMaterialProgress(sortedAttempts);
    setMaterialProgress(progress);

    // Process skill scores
    const skills = processSkillScores(sortedAttempts);
    setSkillScores(skills);

    // Process stats
    const statsData = processStats(sortedAttempts);
    setStats(statsData);
  };

  const processTestScores = (attempts: AttemptWithMockTest[]) => {
    // Group attempts by month
    const monthlyScores: Record<string, { 
      reading: number[], 
      listening: number[], 
      writing: number[], 
      speaking: number[] 
    }> = {};

    attempts.forEach(attempt => {
      if (attempt.status === "completed" && attempt.totalScore !== undefined) {
        const date = new Date(attempt.completedAt || attempt.startedAt);
        const month = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyScores[month]) {
          monthlyScores[month] = {
            reading: [],
            listening: [],
            writing: [],
            speaking: []
          };
        }

        const category = attempt.mockTestCategory || "";
        if (category.includes("reading")) {
          monthlyScores[month].reading.push(attempt.totalScore);
        } else if (category.includes("listening")) {
          monthlyScores[month].listening.push(attempt.totalScore);
        } else if (category.includes("writing")) {
          monthlyScores[month].writing.push(attempt.totalScore);
        } else if (category.includes("speaking")) {
          monthlyScores[month].speaking.push(attempt.totalScore);
        }
      }
    });

    // Calculate average scores for each month
    return Object.entries(monthlyScores).map(([month, scores]) => {
      const getAverage = (arr: number[]) => arr.length > 0 ? 
        +(arr.reduce((sum, score) => sum + score, 0) / arr.length).toFixed(1) : null;

      return {
        date: month,
        reading: getAverage(scores.reading) || 0,
        listening: getAverage(scores.listening) || 0,
        writing: getAverage(scores.writing) || 0,
        speaking: getAverage(scores.speaking) || 0
      };
    });
  };

  const processStudyHours = (attempts: AttemptWithMockTest[]) => {
    // Create a simulated study hours pattern based on when tests were taken
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hoursData = daysOfWeek.map(day => ({ day, hours: 0 }));
    
    // Count attempts by day of week (as a proxy for study activity)
    attempts.forEach(attempt => {
      const date = new Date(attempt.startedAt);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Add 2-4 hours per attempt as an estimate
      const studyHours = 2 + Math.floor(Math.random() * 3);
      hoursData[dayIndex].hours += studyHours;
    });
    
    // Normalize the data to be more realistic
    const maxHours = Math.max(...hoursData.map(d => d.hours));
    if (maxHours > 0) {
      hoursData.forEach(day => {
        if (day.hours === 0) {
          // Add some hours to days with no attempts
          day.hours = 1 + Math.floor(Math.random() * 2);
        } else if (day.hours > 8) {
          // Cap at 8 hours
          day.hours = 8;
        }
      });
    } else {
      // If no attempts, create sample data
      hoursData.forEach((day, i) => {
        day.hours = 2 + Math.floor(Math.random() * 4);
      });
    }
    
    return hoursData;
  };

  const processMaterialProgress = (attempts: AttemptWithMockTest[]) => {
    const completedCount = attempts.filter(a => a.status === "completed").length;
    const inProgressCount = attempts.filter(a => a.status === "in_progress").length;
    const totalTests = attempts.length;
    
    // Calculate percentages
    const completedPercentage = Math.round((completedCount / Math.max(totalTests, 1)) * 100);
    const inProgressPercentage = Math.round((inProgressCount / Math.max(totalTests, 1)) * 100);
    const notStartedPercentage = Math.max(0, 100 - completedPercentage - inProgressPercentage);
    
    return [
      { name: "Completed", value: completedPercentage },
      { name: "In Progress", value: inProgressPercentage },
      { name: "Not Started", value: notStartedPercentage }
    ];
  };

  const processSkillScores = (attempts: AttemptWithMockTest[]) => {
    // Group attempts by skill category
    const skillScores: Record<string, { total: number, count: number }> = {
      "Reading": { total: 0, count: 0 },
      "Listening": { total: 0, count: 0 },
      "Writing": { total: 0, count: 0 },
      "Speaking": { total: 0, count: 0 }
    };

    attempts.forEach(attempt => {
      if (attempt.status === "completed" && attempt.totalScore !== undefined) {
        const category = attempt.mockTestCategory;
        if (category) {
          if (category.includes("reading")) {
            skillScores["Reading"].total += attempt.totalScore;
            skillScores["Reading"].count += 1;
          } else if (category.includes("listening")) {
            skillScores["Listening"].total += attempt.totalScore;
            skillScores["Listening"].count += 1;
          } else if (category.includes("writing")) {
            skillScores["Writing"].total += attempt.totalScore;
            skillScores["Writing"].count += 1;
          } else if (category.includes("speaking")) {
            skillScores["Speaking"].total += attempt.totalScore;
            skillScores["Speaking"].count += 1;
          }
        }
      }
    });

    // Calculate average scores and percentages
    const getSkillData = (skillName: string) => {
      const data = skillScores[skillName];
      const score = data.count > 0 ? +(data.total / data.count).toFixed(1) : 0;
      // Convert score to percentage (assuming max score is 10)
      const percentage = score * 10;
      return { score, percentage };
    };

    return {
      reading: getSkillData("Reading"),
      listening: getSkillData("Listening"),
      writing: getSkillData("Writing"),
      speaking: getSkillData("Speaking")
    };
  };

  const processStats = (attempts: AttemptWithMockTest[]) => {
    // Calculate average score
    const completedAttempts = attempts.filter(a => a.status === "completed");
    const totalScore = completedAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0);
    const averageScore = completedAttempts.length > 0 ? (totalScore / completedAttempts.length).toFixed(1) : "0.0";
    
    // Calculate total study hours (estimated)
    const studyHoursPerTest = 3; // Assume average of 3 hours per test
    const studyHours = attempts.length * studyHoursPerTest;
    
    // Calculate materials completed percentage
    const materialsCompleted = Math.round((completedAttempts.length / Math.max(attempts.length, 1)) * 100);
    
    // Count mock tests taken
    const mockTestsTaken = attempts.length;
    
    return {
      averageScore,
      studyHours,
      materialsCompleted,
      mockTestsTaken
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Progress Overview</h1>
        <p className="text-gray-500">
          Track your improvement and study activities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <h3 className="text-2xl font-bold">{stats.averageScore}</h3>
                <p className="text-xs text-green-600">Based on completed tests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Study Hours</p>
                <h3 className="text-2xl font-bold">{stats.studyHours}h</h3>
                <p className="text-xs text-orange-600">Estimated total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Materials Completed</p>
                <h3 className="text-2xl font-bold">{stats.materialsCompleted}%</h3>
                <p className="text-xs text-blue-600">Of assigned tests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mock Tests Taken</p>
                <h3 className="text-2xl font-bold">{stats.mockTestsTaken}</h3>
                <p className="text-xs text-purple-600">Total attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mock Test Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Mock Test Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTestScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 9]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reading"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="listening"
                    stroke="#4ade80"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="writing"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="speaking"
                    stroke="#a855f7"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Study Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-gray-500" />
              Skills Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Reading</span>
                <span className="text-sm text-gray-500">{skillScores.reading.score.toFixed(1)}</span>
              </div>
              <Progress value={skillScores.reading.percentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Listening</span>
                <span className="text-sm text-gray-500">{skillScores.listening.score.toFixed(1)}</span>
              </div>
              <Progress value={skillScores.listening.percentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Writing</span>
                <span className="text-sm text-gray-500">{skillScores.writing.score.toFixed(1)}</span>
              </div>
              <Progress value={skillScores.writing.percentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Speaking</span>
                <span className="text-sm text-gray-500">{skillScores.speaking.score.toFixed(1)}</span>
              </div>
              <Progress value={skillScores.speaking.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Study Materials Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-500" />
              Study Materials Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {materialProgress.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6">
                {materialProgress.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
