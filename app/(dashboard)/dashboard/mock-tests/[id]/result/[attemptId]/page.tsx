import {
	getStudentAttemptById,
	getStudentResponsesByAttemptId,
	getQuestionsByMockTestId,
} from "@/controllers/MockTestController";
import { StudentAttempt, Question, StudentResponse } from "@/lib/types/mock-test";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface CombinedAttemptData extends StudentAttempt {
	responses: StudentResponse[];
	totalPossibleScore: number;
	timeTaken: number;
}

export default function ResultPage(props: {
	params: Promise<{ id: string; attemptId: string }>;
}) {
	const params = use(props.params);
	const [attempt, setAttempt] = useState<CombinedAttemptData | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const loadResult = async () => {
			try {
				setLoading(true);
				const attemptData = await getStudentAttemptById(params.attemptId);
				const questionsData = await getQuestionsByMockTestId(
					attemptData.mockTestId,
				);
				const responsesData = await getStudentResponsesByAttemptId(
					params.attemptId,
				);

                // Map Documents to Question objects
                const typedQuestions = questionsData.map((doc) => ({
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

                // Map Documents to StudentResponse objects
                const typedResponses = responsesData.map((doc) => ({
                    id: doc.$id,
                    attemptId: doc.attemptId,
                    questionId: doc.questionId,
                    response: doc.response,
                    score: doc.score,
                    aiScore: doc.aiScore,
                    feedback: doc.feedback,
                    gradedAt: doc.gradedAt,
                    gradedBy: doc.gradedBy

                }))

				// Map Document to StudentAttempt
				const typedAttempt: StudentAttempt = {
					id: attemptData.$id,
					userId: attemptData.userId,
					mockTestId: attemptData.mockTestId,
					startedAt: attemptData.startedAt,
					completedAt: attemptData.completedAt,
					status: attemptData.status,
					totalScore: attemptData.totalScore,
					percentageScore: attemptData.percentageScore,
				};

                // Calculate totalPossibleScore
                const totalPossibleScore = typedQuestions.reduce((total, question) => total + question.marks, 0);

                // Calculate timeTaken (in seconds)
                let timeTaken = 0;
                if (typedAttempt.startedAt && typedAttempt.completedAt) {
                    const startTime = new Date(typedAttempt.startedAt).getTime();
                    const endTime = new Date(typedAttempt.completedAt).getTime();
                    timeTaken = Math.round((endTime - startTime) / 1000);
                }

				// Combine attempt data, responses, and calculated values
				const combinedData: CombinedAttemptData = {
					...typedAttempt,
					responses: typedResponses,
					totalPossibleScore,
					timeTaken,
				};

                setQuestions(typedQuestions);
				setAttempt(combinedData);
			} catch (error) {
				console.error("Error loading result:", error);
				toast.error("Failed to load result");
			} finally {
				setLoading(false);
			}
		};

		loadResult();
	}, [params.attemptId, params.id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-[400px]">
					<CardContent className="p-6">
						<div className="text-center">Loading result...</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Helper function to determine grade and color
	const getGradeInfo = (score: number) => {
		if (score >= 90) return { grade: "A", color: "text-green-500" };
		if (score >= 80) return { grade: "B", color: "text-blue-500" };
		if (score >= 70) return { grade: "C", color: "text-yellow-500" };
		if (score >= 60) return { grade: "D", color: "text-orange-500" };
		return { grade: "F", color: "text-red-500" };
	};

	if (!attempt) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-[400px]">
					<CardContent className="p-6">
						<div className="text-center">Result not found.</div>
					</CardContent>
				</Card>
			</div>
		);
	}

    // Helper function to render response based on its type
    const renderResponse = (response: any) => {
        if (typeof response === 'string') {
            return response;
        } else if (Array.isArray(response)) {
            return response.join(', '); // Or any other way you want to display arrays
        } else if (typeof response === 'object' && response !== null) {
            return JSON.stringify(response); // Stringify objects
        }
        return 'Unknown response type'; // Fallback for unexpected types
    };

	const gradeInfo = getGradeInfo(attempt?.percentageScore || 0);

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8">
				<Button variant="ghost" onClick={() => router.push("/mock-tests")}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
				</Button>
			</div>

            {/* Score Overview Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Exam Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Score</p>
                            <h3 className="text-3xl font-bold">
                                {attempt?.totalScore}/{attempt?.totalPossibleScore}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Percentage</p>
                            <h3 className="text-3xl font-bold">
                                {attempt?.percentageScore?.toFixed(2) ?? "N/A"}%
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Grade</p>
                            <h3 className={`text-3xl font-bold ${gradeInfo.color}`}>
                                {gradeInfo.grade}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Time Taken</p>
                            <h3 className="text-3xl font-bold">
                                {Math.floor(attempt?.timeTaken / 60)}m{" "}
                                {attempt?.timeTaken % 60}s
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Progress value={attempt?.percentageScore || 0} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Question Review */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Your Answer</TableHead>
                                <TableHead>Correct Answer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attempt?.responses.map((response, index) => {
                                const question = questions.find(q => q.id === response.questionId);
                                const correctAnswer = question?.questionType === "multiple_choice"
                                    ? question.options?.find((opt: any) => opt.isCorrect)?.text
                                    : question?.correctAnswer;

                                return (
                                    <TableRow key={response.questionId}>
                                        <TableCell className="font-medium">
                                            Question {index + 1}
                                        </TableCell>
                                        <TableCell>{renderResponse(response.response)}</TableCell>
                                        <TableCell>{correctAnswer}</TableCell>
                                        <TableCell>
                                            {response.score && question && response.score >= question.marks? (
                                                <Badge className="bg-green-500 text-white">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Correct
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Incorrect
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {response.score}/{question?.marks}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

			{/* Action Buttons */}
			<div className="flex justify-end mt-6 space-x-4">
				<Button variant="outline" onClick={() => router.push("/mock-tests")}>
					Back to Tests
				</Button>
				<Button onClick={() => window.print()}>Download Result</Button>
			</div>
		</div>
	);
}
