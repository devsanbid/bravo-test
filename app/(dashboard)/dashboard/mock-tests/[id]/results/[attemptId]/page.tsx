"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  getStudentAttemptById,
  getQuestionsByMockTestId,
  getMockTestById,
  getStudentResponsesByAttemptId,
} from "@/controllers/MockTestController";
import { Question, StudentResponse } from "@/lib/types/mock-test";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  BarChart3, 
  PieChart, 
  Trophy, 
  ArrowLeft,
  ThumbsUp,
  Star,
  AlertTriangle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart as RechartPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts";

export default function ResultsPage(
  props: {
    params: Promise<{ id: string; attemptId: string }>;
  }
) {
  const params = use(props.params);
  const [loading, setLoading] = useState(true);
  const [mockTest, setMockTest] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);
  const [categoryScores, setCategoryScores] = useState<any[]>([]);
  const router = useRouter();

  // Colors for charts
  const COLORS = ['#4ade80', '#f87171', '#a3a3a3'];
  const RADIAN = Math.PI / 180;

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const attemptData = await getStudentAttemptById(params.attemptId);
        const mockTestData = await getMockTestById(params.id);
        const questionsData = await getQuestionsByMockTestId(params.id);
        const responsesData = await getStudentResponsesByAttemptId(params.attemptId);
        
        // Process questions
        const parsedQuestions = questionsData.map((doc: any) => ({
          id: doc.$id,
          mockTestId: doc.mockTestId,
          questionType: doc.questionType,
          questionText: doc.questionText,
          options: doc.options,
          correctAnswer: doc.correctAnswer,
          marks: doc.marks,
          order: doc.order,
        }));
        
        // Calculate statistics
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        
        // Create a map of responses by question ID for easier lookup
        const responseMap = new Map();
        responsesData.forEach((response: any) => {
          responseMap.set(response.questionId, response);
        });
        
        // Count correct, incorrect, and unanswered questions
        parsedQuestions.forEach((question: any) => {
          const response = responseMap.get(question.id);
          
          if (!response) {
            unanswered++;
          } else if (question.questionType === "essay" || question.questionType === "short_answer") {
            // For essay and short answer questions, they will be marked later by a moderator
            // Don't count them as correct or incorrect yet
            // We'll display them separately in the UI
          } else if (question.questionType === "multiple_choice") {
            // For multiple choice, check if the selected option is correct
            const correctOption = Array.isArray(question.options) 
              ? question.options.find((opt: any) => {
                  try {
                    const parsedOpt = typeof opt === 'string' ? JSON.parse(opt) : opt;
                    return parsedOpt.isCorrect;
                  } catch (e) {
                    return false;
                  }
                })
              : null;
              
            const responseValue = typeof response.response === 'string' 
              ? response.response 
              : JSON.stringify(response.response);
              
            const correctValue = correctOption 
              ? (typeof correctOption === 'string' 
                ? JSON.parse(correctOption).text 
                : correctOption.text) 
              : null;
              
            if (responseValue === correctValue) {
              correct++;
              // Mark the response as correct for display purposes
              response.isCorrect = true;
            } else {
              incorrect++;
              // Mark the response as incorrect for display purposes
              response.isCorrect = false;
            }
          } else {
            // For other question types, use the isCorrect flag if available
            if (response.isCorrect) {
              correct++;
            } else {
              incorrect++;
            }
          }
        });
        
        // Set state
        setMockTest(mockTestData);
        setAttempt(attemptData);
        setQuestions(parsedQuestions);
        // Cast the response data to StudentResponse[]
        setResponses(responsesData as unknown as StudentResponse[]);
        setCorrectAnswers(correct);
        setIncorrectAnswers(incorrect);
        setUnansweredQuestions(unanswered);
        
        // Create data for pie chart
        setCategoryScores([
          { name: 'Correct', value: correct, color: '#4ade80' },
          { name: 'Incorrect', value: incorrect, color: '#f87171' },
          { name: 'Unanswered', value: unanswered, color: '#a3a3a3' }
        ]);
        
      } catch (error) {
        console.error("Error loading results:", error);
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [params.id, params.attemptId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate time spent
  const calculateTimeSpent = () => {
    if (!attempt || !attempt.startedAt || !attempt.completedAt) return "N/A";
    
    const startTime = new Date(attempt.startedAt).getTime();
    const endTime = new Date(attempt.completedAt).getTime();
    const timeSpentMs = endTime - startTime;
    
    const hours = Math.floor(timeSpentMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeSpentMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeSpentMs % (1000 * 60)) / 1000);
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };

  // Get performance message based on score
  const getPerformanceMessage = () => {
    if (!attempt || attempt.percentageScore === undefined) return "";
    
    const score = attempt.percentageScore;
    
    if (score >= 90) {
      return "Excellent! You've demonstrated outstanding knowledge and skills.";
    } else if (score >= 80) {
      return "Great job! You've shown a strong understanding of the material.";
    } else if (score >= 70) {
      return "Good work! You've demonstrated solid knowledge with some areas to improve.";
    } else if (score >= 60) {
      return "You've passed with a satisfactory performance. Keep practicing to improve!";
    } else {
      return "You need more practice in this area. Don't give up, keep studying!";
    }
  };

  // Get score color based on percentage
  const getScoreColor = () => {
    if (!attempt || attempt.percentageScore === undefined) return "text-gray-500";
    
    const score = attempt.percentageScore;
    
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-center">Loading Results</CardTitle>
            <CardDescription className="text-center">Please wait while we prepare your results</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Calculating your score and preparing your results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt || !mockTest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
            <CardDescription className="text-center">Could not load test results</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="text-muted-foreground">There was a problem loading your test results. Please try again later.</p>
              <Button onClick={() => router.push('/dashboard/mock-tests')}>
                Return to Mock Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Header with score */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{mockTest.title} Results</h1>
        <p className="text-muted-foreground mb-6">Completed on {formatDate(attempt.completedAt || attempt.startedAt)}</p>
        
        <div className="flex flex-col items-center justify-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {Math.round(attempt.percentageScore || 0)}%
          </div>
          <div className="text-xl font-medium mb-4">
            {attempt.totalScore || 0} out of {mockTest.totalMarks || questions.reduce((sum: number, q: any) => sum + q.marks, 0)} marks
          </div>
          <Badge 
            variant={attempt.percentageScore >= 60 ? "default" : "destructive"}
            className="text-lg py-1 px-4"
          >
            {attempt.percentageScore >= 60 ? "PASSED" : "FAILED"}
          </Badge>
        </div>
      </div>

      {/* Performance message */}
      <Card className="mb-8 border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ThumbsUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Performance Feedback</h3>
              <p className="text-muted-foreground">{getPerformanceMessage()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <h3 className="text-2xl font-bold">{calculateTimeSpent()}</h3>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <h3 className="text-2xl font-bold text-green-500">{correctAnswers} <span className="text-sm text-muted-foreground">/ {questions.length}</span></h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                <h3 className="text-2xl font-bold text-red-500">{incorrectAnswers} <span className="text-sm text-muted-foreground">/ {questions.length}</span></h3>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <h3 className="text-2xl font-bold">
                  {questions.length > 0 
                    ? Math.round((correctAnswers / (questions.length - unansweredQuestions)) * 100) || 0
                    : 0}%
                </h3>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Distribution of correct, incorrect, and unanswered questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={categoryScores}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} questions`, '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value, entry, index) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Score Comparison</CardTitle>
            <CardDescription>Your score compared to the passing threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="90%" 
                  barSize={20} 
                  data={[
                    {
                      name: 'Your Score',
                      value: attempt.percentageScore || 0,
                      fill: attempt.percentageScore >= 60 ? '#4ade80' : '#f87171',
                    },
                    {
                      name: 'Passing Score',
                      value: 60,
                      fill: '#94a3b8',
                    }
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    label={{ 
                      position: 'insideStart', 
                      fill: '#fff',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review your answers and see the correct solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const response = responses.find(r => r.questionId === question.id);
              const isCorrect = response?.isCorrect;
              const userAnswer = response?.response;
              const isWritingQuestion = question.questionType === "essay" || question.questionType === "short_answer";
              
              // Find correct answer
              let correctAnswer = "";
              if (question.questionType === "multiple_choice" && Array.isArray(question.options)) {
                const correctOption = question.options.find((opt: any) => {
                  try {
                    const parsedOpt = typeof opt === 'string' ? JSON.parse(opt) : opt;
                    return parsedOpt.isCorrect;
                  } catch (e) {
                    return false;
                  }
                });
                
                if (correctOption) {
                  correctAnswer = typeof correctOption === 'string' 
                    ? JSON.parse(correctOption).text 
                    : correctOption.text;
                }
              } else if (question.correctAnswer) {
                correctAnswer = Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.join(", ") 
                  : question.correctAnswer;
              }
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Question {index + 1}</span>
                      {isWritingQuestion ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Marks Given Later
                        </Badge>
                      ) : (
                        <Badge variant={isCorrect ? "default" : userAnswer ? "destructive" : "outline"}>
                          {isCorrect ? "Correct" : userAnswer ? "Incorrect" : "Unanswered"}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{question.marks} {question.marks === 1 ? "mark" : "marks"}</Badge>
                  </div>
                  
                  <p className="mb-4">{question.questionText}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Your Answer:</p>
                      <div className={`p-3 rounded-md ${isCorrect ? "bg-green-50 border border-green-200" : userAnswer ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
                        {userAnswer ? (
                          <p className="text-sm">{typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer)}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No answer provided</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Correct Answer:</p>
                      {isWritingQuestion ? (
                        <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                          <p className="text-sm italic">Writing questions are evaluated by moderators. Marks will be given later.</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-md bg-green-50 border border-green-200">
                          <p className="text-sm">{correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {response?.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm font-medium mb-1">Feedback:</p>
                      <p className="text-sm">{response.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => router.push('/dashboard/mock-tests')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
        </Button>
        
        <Button 
          className="gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <Trophy className="h-4 w-4" /> View Dashboard
        </Button>
      </div>
    </div>
  );
}
