"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import {
	getMockTestById,
	getQuestionsByMockTestId,
	createQuestion,
	updateQuestion,
	deleteQuestion,
	getAllQuestion,
} from "@/controllers/MockTestController";
import { MockTest, Question, QuestionType } from "@/lib/types/mock-test";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
	ArrowLeft,
	PlusCircle,
	Edit,
	Trash2,
	FileText,
	Headphones,
	PenTool,
	Mic,
} from "lucide-react";

export default function MockTestDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [mockTest, setMockTest] = useState<MockTest | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<QuestionType>("multiple_choice");
    const router = useRouter();
    const { user, checkUser } = useAuthStore();

    useEffect(() => {
		if (params.id) {
			fetchMockTest();
			fetchQuestions();
		}
	}, [params.id]);

    const fetchMockTest = async () => {
		try {
			const test = await getMockTestById(params.id);
			console.log("test = ", test);
			await checkUser();
			setMockTest(test as MockTest);
		} catch (error) {
			console.error("Error fetching mock test:", error);
			toast.error("Failed to load mock test");
		}
	};

    const fetchQuestions = async () => {
		try {
			setLoading(true);
			console.log("sfasasfasfs");
			const fetchedQuestions = await getQuestionsByMockTestId(params.id);
			console.log("fetch question = ", fetchedQuestions);
			setQuestions(fetchedQuestions as Question[]);
		} catch (error) {
			console.error("Error fetching questions:", error);
			toast.error("Failed to load questions");
		} finally {
			setLoading(false);
		}
	};

    const handleDeleteQuestion = async (id: string) => {
		try {
			await deleteQuestion(id);
			toast.success("Question deleted successfully");
			fetchQuestions();
		} catch (error) {
			console.error("Error deleting question:", error);
			toast.error("Failed to delete question");
		}
	};

    const getCategoryIcon = (category: string) => {
		switch (category) {
			case "reading":
				return <FileText className="h-5 w-5 mr-2" />;
			case "listening":
				return <Headphones className="h-5 w-5 mr-2" />;
			case "writing":
				return <PenTool className="h-5 w-5 mr-2" />;
			case "speaking":
				return <Mic className="h-5 w-5 mr-2" />;
			default:
				return null;
		}
	};

    const filteredQuestions = () => {
		return questions.filter((q) => q.questionType === activeTab);
	};

    if (!user || user.profile?.role !== "mod") {
		return (
			<div className="flex items-center justify-center h-screen">
				<Card className="w-[450px]">
					<CardHeader>
						<CardTitle className="text-center text-red-500">
							Access Denied
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-center">
							You do not have permission to access this page.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

    if (!mockTest) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex justify-center items-center h-40">
					<p>Loading mock test...</p>
				</div>
			</div>
		);
	}

    return (
		<div className="container mx-auto py-6">
			<div className="flex items-center mb-6">
				<Button
					variant="ghost"
					onClick={() => router.push("/mod/mock-tests")}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
				</Button>
				<h1 className="text-3xl font-bold">{mockTest.title}</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							{getCategoryIcon(mockTest.category)}
							{mockTest.category.charAt(0).toUpperCase() +
								mockTest.category.slice(1)}{" "}
							Test
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div>
								<span className="font-semibold">Duration:</span>{" "}
								{mockTest.duration} minutes
							</div>
							<div>
								<span className="font-semibold">Total Marks:</span>{" "}
								{mockTest.totalMarks}
							</div>
							<div>
								<span className="font-semibold">Status:</span>{" "}
								<span
									className={
										mockTest.isActive ? "text-green-600" : "text-red-600"
									}
								>
									{mockTest.isActive ? "Active" : "Inactive"}
								</span>
							</div>
							{mockTest.scheduledDate && (
								<div>
									<span className="font-semibold">Scheduled For:</span>{" "}
									{new Date(mockTest.scheduledDate).toLocaleString()}
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button
							variant="outline"
							onClick={() => router.push(`/mod/mock-tests/${params.id}/edit`)}
						>
							<Edit className="mr-2 h-4 w-4" /> Edit Test
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								router.push(`/mod/mock-tests/${params.id}/preview`)
							}
						>
							Preview Test
						</Button>
					</CardFooter>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-line">{mockTest.description}</p>
						{mockTest.instructions && (
							<>
								<h3 className="font-semibold mt-4 mb-2">Instructions:</h3>
								<p className="whitespace-pre-line">{mockTest.instructions}</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">Questions</h2>
				<Button
					onClick={() =>
						router.push(`/mod/mock-tests/${params.id}/questions/create`)
					}
				>
					<PlusCircle className="mr-2 h-4 w-4" /> Add Question
				</Button>
			</div>

			<Tabs
				defaultValue="multiple_choice"
				onValueChange={(value) => setActiveTab(value as QuestionType)}
			>
				<TabsList className="grid grid-cols-4 mb-6">
					<TabsTrigger value="multiple_choice">Multiple Choice</TabsTrigger>
					<TabsTrigger value="fill_blank">Fill in the Blanks</TabsTrigger>
					<TabsTrigger value="essay">Essay</TabsTrigger>
					{mockTest.category === "speaking" && (
						<TabsTrigger value="speaking">Speaking</TabsTrigger>
					)}
					{mockTest.category !== "speaking" && (
						<TabsTrigger value="short_answer">Short Answer</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value={activeTab}>
					<Card>
						<CardHeader>
							<CardTitle>
								{activeTab
									.split("_")
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(" ")}{" "}
								Questions
							</CardTitle>
							<CardDescription>
								Manage{" "}
								{activeTab
									.split("_")
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(" ")}{" "}
								questions for this test.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex justify-center items-center h-40">
									<p>Loading questions...</p>
								</div>
							) : filteredQuestions().length === 0 ? (
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										No{" "}
										{activeTab
											.split("_")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1),
											)
											.join(" ")}{" "}
										questions found.
									</p>
									<Button
										variant="outline"
										className="mt-4"
										onClick={() =>
											router.push(
												`/mod/mock-tests/${params.id}/questions/create?type=${activeTab}`,
											)
										}
									>
										Add your first{" "}
										{activeTab
											.split("_")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1),
											)
											.join(" ")}{" "}
										question
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{filteredQuestions()
										.sort((a, b) => a.order - b.order)
										.map((question, index) => (
											<Card key={question.id} className="relative">
												<CardHeader className="pb-2">
													<CardTitle className="text-lg flex items-start">
														<span className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
															{index + 1}
														</span>
														<span className="flex-1">
															{question.questionText}
														</span>
													</CardTitle>
												</CardHeader>
												<CardContent>
													{question.questionImage && (
														<div className="mb-4">
															<img
																src={question.questionImage}
																alt="Question image"
																className="max-h-40 object-contain"
															/>
														</div>
													)}

													{question.audioUrl && (
														<div className="mb-4">
															<audio controls className="w-full">
																<source
																	src={question.audioUrl}
																	type="audio/mpeg"
																/>
																Your browser does not support the audio element.
															</audio>
														</div>
													)}

													{question.questionType === "multiple_choice" &&
														question.options && (
															<div className="space-y-2">
																{question.options.map((option, i) => (
																	<div
																		key={JSON.parse(option).id}
																		className={`p-2 rounded-md ${option.isCorrect ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}
																	>
																		<span className="mr-2">
																			{String.fromCharCode(65 + i)}.
																		</span>
																		{JSON.parse(option).text}
																		{JSON.parse(option).isCorrect && (
																			<span className="ml-2 text-green-600 text-sm">
																				(Correct)
																			</span>
																		)}
																	</div>
																))}
															</div>
														)}

													{question.questionType === "fill_blank" && (
														<div>
															<p className="font-medium">
																Answer:{" "}
																{Array.isArray(question.correctAnswer)
																	? question.correctAnswer.join(", ")
																	: question.correctAnswer}
															</p>
														</div>
													)}

													{question.questionType === "essay" && (
														<div>
															<p className="text-sm text-muted-foreground">
																Essay question - Students will provide a written
																response.
															</p>
														</div>
													)}

													{question.questionType === "speaking" && (
														<div>
															<p className="text-sm text-muted-foreground">
																Speaking question - Students will record an
																audio response.
															</p>
														</div>
													)}

													{question.questionType === "short_answer" && (
														<div>
															<p className="font-medium">
																Expected Answer:{" "}
																{Array.isArray(question.correctAnswer)
																	? question.correctAnswer.join(", ")
																	: question.correctAnswer}
															</p>
														</div>
													)}

													<div className="mt-4 flex items-center justify-between">
														<div>
															<span className="text-sm font-medium">
																Marks: {question.marks}
															</span>
															{question.timeLimit && (
																<span className="text-sm font-medium ml-4">
																	Time Limit: {question.timeLimit} seconds
																</span>
															)}
														</div>
														<div className="flex gap-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	router.push(
																		`/mod/mock-tests/${params.id}/questions/${question.id}/edit`,
																	)
																}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button variant="outline" size="sm">
																		<Trash2 className="h-4 w-4 text-red-500" />
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>
																			Are you sure?
																		</AlertDialogTitle>
																		<AlertDialogDescription>
																			This action cannot be undone. This will
																			permanently delete the question and all
																			associated student responses.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>
																			Cancel
																		</AlertDialogCancel>
																		<AlertDialogAction
																			className="bg-red-500 hover:bg-red-600"
																			onClick={() =>
																				handleDeleteQuestion(question.id)
																			}
																		>
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-between">
							<div>
								<span className="text-sm text-muted-foreground">
									Total{" "}
									{activeTab
										.split("_")
										.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
										.join(" ")}{" "}
									Questions: {filteredQuestions().length}
								</span>
							</div>
							<Button
								onClick={() =>
									router.push(
										`/mod/mock-tests/${params.id}/questions/create?type=${activeTab}`,
									)
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Add Question
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
