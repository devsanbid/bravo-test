"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getQuestionsByMockTestId, getMockTestById } from "@/controllers/MockTestController";
import { Question, MockTest } from "@/lib/types/mock-test";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Clock } from "lucide-react";
import Image from "next/image";

export default function PreviewQuestionPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [question, setQuestion] = useState<Question | null>(null);
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the question
        const questions = await getQuestionsByMockTestId(params.id);
        const question = questions.find(q => q.$id === params.questionId || q.id === params.questionId);
        
        if (question) {
          // Parse options if they're stored as strings
          if (question.questionType === "multiple_choice" && Array.isArray(question.options)) {
            if (typeof question.options[0] === 'string') {
              question.options = question.options.map(opt => {
                try {
                  return JSON.parse(opt);
                } catch (e) {
                  return { id: opt, text: opt, isCorrect: false };
                }
              });
            }
          }
          
          setQuestion(question);
          
          // Fetch the mock test data
          const mockTestData = await getMockTestById(params.id);
          setMockTest(mockTestData);
        } else {
          toast.error("Question not found");
          router.push(`/mod/mock-tests/${params.id}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load question data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <p>Loading question data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question || !mockTest) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <p>Question not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Question Preview</h1>
        </div>
        <Button 
          onClick={() => router.push(`/mod/mock-tests/${params.id}/questions/${question.id}/edit`)}
          variant="outline"
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit Question
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Question {question.order}</CardTitle>
              <CardDescription>
                {mockTest.title} - {mockTest.category.charAt(0).toUpperCase() + mockTest.category.slice(1)} Test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-lg font-medium">{question.questionText}</p>
              </div>

              {question.questionImage && (
                <div className="mt-4">
                  <div className="relative h-64 w-full">
                    <img 
                      src={question.questionImage} 
                      alt="Question image" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}

              {question.audioUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Audio:</p>
                  <audio controls className="w-full">
                    <source src={question.audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {question.instructions && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">{question.instructions}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">Answer Format:</h3>
                
                {question.questionType === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options.map((option: any, index: number) => (
                      <div 
                        key={JSON.parse(option).id} 
                        className={`p-3 rounded-md border ${JSON.parse(option).isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-2">{String.fromCharCode(65 + index)}.</div>
                          <div className="flex-grow">{JSON.parse(option).text}</div>
                          {JSON.parse(option).isCorrect && (
                            <div className="text-green-600 font-medium text-sm">Correct Answer</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(question.questionType === "fill_blank" || question.questionType === "short_answer") && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-md border border-green-500 bg-green-50">
                      <p className="font-medium">Correct Answer: {question.correctAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Question Type:</span>
                <span className="text-sm">
                  {question.questionType === "multiple_choice" && "Multiple Choice"}
                  {question.questionType === "fill_blank" && "Fill in the Blank"}
                  {question.questionType === "short_answer" && "Short Answer"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Marks:</span>
                <span className="text-sm">{question.marks}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Order:</span>
                <span className="text-sm">{question.order}</span>
              </div>
              
              {question.timeLimit && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Time Limit:</span>
                  <span className="text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {question.timeLimit} seconds
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                onClick={() => router.push(`/mod/mock-tests/${params.id}/questions`)}
                variant="secondary"
                className="w-full"
              >
                View All Questions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
