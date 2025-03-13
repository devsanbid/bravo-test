"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/authStore";
import RichTextEditor from "./RichTextEditor";
import {
	getStudentAttemptById,
	getQuestionsByMockTestId,
    getMockTestById,
	updateStudentResponse,
	completeStudentAttempt,
	createStudentResponse,
	getStudentResponsesByAttemptId
} from "@/controllers/MockTestController";
import { Question } from "@/lib/types/mock-test";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function TakeExamPage(
    props: {
        params: Promise<{ id: string; attemptId: string }>;
    }
) {
    const params = use(props.params);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [initialDuration, setInitialDuration] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [mockTestTitle, setMockTestTitle] = useState("");
    const [mockTestCategory, setMockTestCategory] = useState("");
    const [examStartTime, setExamStartTime] = useState<Date | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
    const router = useRouter();
    const { user, checkUser } = useAuthStore();

    // Load exam data and initialize timer
    useEffect(() => {
      const loadExam = async () => {
        try {
          setLoading(true);
          checkUser();
          const attempt = await getStudentAttemptById(params.attemptId);
          const examQuestions = await getQuestionsByMockTestId(params.id);
          const mockTest = await getMockTestById(params.id);

          // Set mock test details
          setMockTestTitle(mockTest.title);
          setMockTestCategory(mockTest.category);
          
          // Map Documents to Question objects
          const typedQuestions = examQuestions.map((doc) => ({
            id: doc.$id,
            mockTestId: doc.mockTestId,
            questionType: doc.questionType,
            questionText: doc.questionText,
            options: doc.options,
            instructions: doc.instructions,
            questionImage: doc.questionImage,
            marks: doc.marks,
            order: doc.order,
          }));

          // Parse the options for multiple choice questions
          const parsedQuestions = typedQuestions.map((question) => {
            if (
              question.questionType === "multiple_choice" &&
              Array.isArray(question.options)
            ) {
              return {
                ...question,
                options: question.options.map((opt) => {
                  try {
                    return typeof opt === "string" ? JSON.parse(opt) : opt;
                  } catch (e) {
                    console.error("Error parsing option:", opt);
                    return {
                      id: crypto.randomUUID(),
                      text: opt,
                      isCorrect: false,
                    };
                  }
                }),
              };
            }
            return question;
          });

          // Sort questions by order
          const sortedQuestions = parsedQuestions.sort((a, b) => a.order - b.order);
          setQuestions(sortedQuestions);
          
          // Calculate time remaining based on start time
          const startedAt = new Date(attempt.startedAt);
          setExamStartTime(startedAt);
          
          const durationInSeconds = mockTest.duration * 60;
          setInitialDuration(durationInSeconds);
          
          const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
          const remainingTime = Math.max(0, durationInSeconds - elapsedSeconds);
          
          setTimeRemaining(remainingTime);
          
          // Load existing responses
          const existingResponses = await getStudentResponsesByAttemptId(params.attemptId);
          const responseMap: { [key: string]: string } = {};
          const answeredSet = new Set<string>();
          
          existingResponses.forEach(response => {
            responseMap[response.questionId] = typeof response.response === 'string' 
              ? response.response 
              : JSON.stringify(response.response);
            answeredSet.add(response.questionId);
          });
          
          setResponses(responseMap);
          setAnsweredQuestions(answeredSet);
          
        } catch (error) {
          console.error("Error loading exam:", error);
          toast.error("Failed to load exam");
        } finally {
          setLoading(false);
        }
      };

      loadExam();
    }, [params.id, params.attemptId]);

    // Persistent timer logic with localStorage backup
    useEffect(() => {
        if (timeRemaining <= 0 || !examStartTime) return;

        // Store exam start time in localStorage for persistence
        localStorage.setItem(`exam_${params.attemptId}_start`, examStartTime.toISOString());
        localStorage.setItem(`exam_${params.attemptId}_duration`, initialDuration.toString());

        const timer = setInterval(() => {
            const now = new Date();
            const startTime = new Date(localStorage.getItem(`exam_${params.attemptId}_start`) || examStartTime.toISOString());
            const duration = parseInt(localStorage.getItem(`exam_${params.attemptId}_duration`) || initialDuration.toString());
            
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const remaining = Math.max(0, duration - elapsedSeconds);
            
            setTimeRemaining(remaining);
            
            if (remaining <= 0) {
                clearInterval(timer);
                handleSubmitExam();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, examStartTime, initialDuration, params.attemptId]);

    // Handle answering a question
    const handleAnswer = async (questionId: string, answer: string) => {
        setResponses((prev) => ({ ...prev, [questionId]: answer }));
        setAnsweredQuestions((prev) => new Set(prev).add(questionId));

        try {
            // Check if this is a new response or update
            if (!answeredQuestions.has(questionId)) {
                await createStudentResponse({
                    questionId,
                    response: answer,
                    attemptId: params.attemptId,
                });
            } else {
                await updateStudentResponse(params.attemptId, {
                    questionId,
                    response: answer,
                    attemptId: params.attemptId,
                });
            }
            
            // Don't show toast notification for every keystroke
            // Only show error if something goes wrong
        } catch (error) {
            console.error("Error saving response:", error);
            toast.error("Failed to save answer");
        }
    };

    // Handle submitting the exam
    const handleSubmitExam = async () => {
        try {
            // Calculate score based on responses
            let totalScore = 0;
            let totalPossibleScore = 0;

            questions.forEach((question) => {
                const response = responses[question.id];
                if (question.questionType === "multiple_choice") {
                    const correctOption = question.options?.find((opt) => opt.isCorrect);
                    if (response === correctOption?.text) {
                        totalScore += question.marks;
                    }
                }
                totalPossibleScore += question.marks;
            });

            const percentageScore = Math.round((totalScore / totalPossibleScore) * 100);

            // Clear localStorage timer data
            localStorage.removeItem(`exam_${params.attemptId}_start`);
            localStorage.removeItem(`exam_${params.attemptId}_duration`);

            await completeStudentAttempt(
                params.attemptId,
                totalScore,
                percentageScore,
            );
            
            // Navigate to results page
            router.push(`/dashboard/mock-tests/${params.id}/results/${params.attemptId}`);
        } catch (error) {
            console.error("Error submitting exam:", error);
            toast.error("Failed to submit exam");
        }
    };

    // Format time remaining
    const formatTimeRemaining = () => {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Get time warning class
    const getTimeWarningClass = () => {
        if (timeRemaining < 300) { // Less than 5 minutes
            return "text-red-500 animate-pulse";
        } else if (timeRemaining < 600) { // Less than 10 minutes
            return "text-orange-500";
        }
        return "text-green-500";
    };
    
    // Calculate progress
    const calculateProgress = () => {
        return answeredQuestions.size / questions.length * 100;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-[500px]">
                    <CardHeader>
                        <CardTitle className="text-center">Loading Exam</CardTitle>
                        <CardDescription className="text-center">Please wait while we prepare your test</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Loading questions and preparing your test environment...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 max-w-7xl">
            {/* Exam Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{mockTestTitle}</h1>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                            {mockTestCategory}
                        </Badge>
                        <Badge variant="secondary">
                            {questions.length} Questions
                        </Badge>
                    </div>
                    <div className={`flex items-center gap-2 font-mono text-xl font-bold ${getTimeWarningClass()}`}>
                        <Clock className="h-5 w-5" />
                        {formatTimeRemaining()}
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progress: {answeredQuestions.size} of {questions.length} answered</span>
                        <span>{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                </div>
            </div>
            
            {/* Question Navigation */}
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 mb-6">
                {questions.map((q, index) => (
                    <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? "default" : answeredQuestions.has(q.id) ? "secondary" : "outline"}
                        className="h-10 w-10 p-0"
                        onClick={() => setCurrentQuestionIndex(index)}
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>

            {/* Question Card */}
            <Card className="mb-6 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Question {currentQuestionIndex + 1} 
                                <Badge variant="outline" className="ml-2">
                                    {currentQuestion?.marks} {currentQuestion?.marks === 1 ? "mark" : "marks"}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {currentQuestion?.questionType === "multiple_choice"
                                    ? "Select the correct answer"
                                    : "Enter your answer"}
                            </CardDescription>
                        </div>
                        {answeredQuestions.has(currentQuestion?.id) ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Answered
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <HelpCircle className="h-3 w-3" /> Unanswered
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6 space-y-6">
                    {currentQuestion && (
                        <>
                            {/* Question Text */}
                            <div className="space-y-4">
                                <div className="text-lg font-medium">
                                    {currentQuestion.questionText}
                                </div>

                                {/* Instructions if any */}
                                {currentQuestion.instructions && (
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md border border-border">
                                        <div className="flex items-center gap-2 font-medium mb-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            Instructions:
                                        </div>
                                        {currentQuestion.instructions}
                                    </div>
                                )}

                                {/* Question Image if any */}
                                {currentQuestion.questionImage && (
                                    <div className="mt-4">
                                        <img
                                            src={currentQuestion.questionImage}
                                            alt="Question"
                                            className="max-w-full h-auto rounded-lg border border-border"
                                        />
                                    </div>
                                )}

                                {/* Multiple Choice Options */}
                                {currentQuestion.questionType === "multiple_choice" && (
                                    <RadioGroup
                                        value={responses[currentQuestion.id] || ""}
                                        onValueChange={(value) =>
                                            handleAnswer(currentQuestion.id, value)
                                        }
                                        className="space-y-3 mt-6"
                                    >
                                        {currentQuestion.options?.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <RadioGroupItem value={option.text} id={option.id} />
                                                <Label
                                                    htmlFor={option.id}
                                                    className="flex-grow cursor-pointer text-base"
                                                >
                                                    {option.text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}

                                {/* Short Answer Input */}
                                {currentQuestion.questionType === "short_answer" && (
                                    <div className="space-y-3 mt-6">
                                        <Label htmlFor="answer" className="text-base">Your Answer</Label>
                                        <RichTextEditor
                                            content={responses[currentQuestion.id] || ""}
                                            onChange={(content) =>
                                                handleAnswer(currentQuestion.id, content)
                                            }
                                            placeholder="Type your short answer here..."
                                        />
                                    </div>
                                )}

                                {/* Essay Input */}
                                {currentQuestion.questionType === "essay" && (
                                    <div className="space-y-3 mt-6">
                                        <Label htmlFor="essay" className="text-base">Your Essay</Label>
                                        <RichTextEditor
                                            content={responses[currentQuestion.id] || ""}
                                            onChange={(content) =>
                                                handleAnswer(currentQuestion.id, content)
                                            }
                                            placeholder="Write your essay here..."
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            onClick={handleSubmitExam}
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            <CheckCircle className="h-4 w-4" /> Submit Exam
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="gap-2"
                        >
                            Next <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
            
            {/* Submit Button (Fixed at bottom) */}
            <div className="fixed bottom-4 right-4 z-10">
                <Button
                    onClick={handleSubmitExam}
                    variant="destructive"
                    className="shadow-lg"
                >
                    Submit Exam
                </Button>
            </div>
        </div>
    );
}
