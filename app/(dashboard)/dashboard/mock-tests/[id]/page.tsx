"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import {
	getMockTestById,
	getQuestionsByMockTestId,
	createStudentAttempt,
} from "@/controllers/MockTestController";
import { MockTest, Question } from "@/lib/types/mock-test";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	ArrowLeft,
	FileText,
	Headphones,
	PenTool,
	Mic,
	Clock,
	Calendar,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";

export default function MockTestDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [mockTest, setMockTest] = useState<MockTest | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const router = useRouter();
    const { user,checkUser } = useAuthStore();

    useEffect(() => {
		if (params.id) {
			fetchMockTest();
			fetchQuestions();
		}
	}, [params.id]);

    const fetchMockTest = async () => {
		try {
			const test = await getMockTestById(params.id);
            await checkUser()
			setMockTest(test as MockTest);
		} catch (error) {
			console.error("Error fetching mock test:", error);
			toast.error("Failed to load mock test");
		}
	};

    const fetchQuestions = async () => {
		try {
			setLoading(true);
			const fetchedQuestions = await getQuestionsByMockTestId(params.id);
            console.log("fetched...")
			setQuestions(fetchedQuestions as Question[]);
		} catch (error) {
			console.error("Error fetching questions:", error);
			toast.error("Failed to load questions");
		} finally {
			setLoading(false);
		}
	};

    const handleStartTest = async () => {
		if (!user) {
			toast.error("You must be logged in to take this test");
			return;
		}

		if (!mockTest) {
			toast.error("Test information not available");
			return;
		}

		try {
			// Create a new attempt
			const attempt = await createStudentAttempt({
				userId: user.$id,
				mockTestId: params.id,
			});

            console.log("attempt: ", attempt)

			// Redirect to the test taking page
			router.push(`/dashboard/mock-tests/${params.id}/take/${attempt.id}`);
		} catch (error) {
			console.error("Error starting test:", error);
			toast.error("Failed to start test");
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

    const formatDate = (dateString?: string) => {
		if (!dateString) return "Available now";
		const date = new Date(dateString);
		return date.toLocaleString();
	};

    const isTestAvailable = () => {
		if (!mockTest) return false;

		// If the test has a scheduled date, check if it's in the past
		if (mockTest.scheduledDate) {
			const now = new Date();
			const scheduledDate = new Date(mockTest.scheduledDate);
			return now >= scheduledDate;
		}

		// If no scheduled date, it's available if it's active
		return mockTest.isActive;
	};

    const getQuestionTypeCount = (type: string) => {
		return questions.filter((q) => q.questionType === type).length;
	};

    if (!user) {
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
							You must be logged in to access this page.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

    if (loading || !mockTest) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex justify-center items-center h-40">
					<p>Loading test details...</p>
				</div>
			</div>
		);
	}

    return (
		<div className="container mx-auto py-6">
			<div className="flex items-center mb-6">
				<Button
					variant="ghost"
					onClick={() => router.push("/dashboard/mock-tests")}
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
						<div className="space-y-4">
							<div className="flex items-center">
								<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
								<span>{mockTest.duration} minutes</span>
							</div>
							<div className="flex items-center">
								<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
								<span>{formatDate(mockTest.scheduledDate)}</span>
							</div>
							<div className="flex items-center font-medium">
								<span>Total Marks: {mockTest.totalMarks}</span>
							</div>
							<div className="flex items-center">
								<span>Status: </span>
								{isTestAvailable() ? (
									<Badge className="ml-2 bg-green-500">Available</Badge>
								) : (
									<Badge className="ml-2 bg-yellow-500">Scheduled</Badge>
								)}
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-center">
						<Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
							<DialogTrigger asChild>
								<Button className="w-full" disabled={!isTestAvailable()}>
									{isTestAvailable() ? "Start Test" : "Not Available Yet"}
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Start {mockTest.title}?</DialogTitle>
									<DialogDescription>
										You are about to start the {mockTest.category} test. Once
										started, the timer will begin and you must complete the test
										in {mockTest.duration} minutes.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="flex items-start gap-2">
										<AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Important Information</h4>
											<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
												<li>You cannot pause the test once started</li>
												<li>Ensure you have a stable internet connection</li>
												<li>Prepare any materials you might need</li>
												<li>Find a quiet place without distractions</li>
											</ul>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
										<div>
											<h4 className="font-medium">Test Overview</h4>
											<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
												<li>
													{getQuestionTypeCount("multiple_choice")} multiple
													choice questions
												</li>
												<li>
													{getQuestionTypeCount("fill_blank")} fill in the blank
													questions
												</li>
												{mockTest.category === "writing" && (
													<li>
														{getQuestionTypeCount("essay")} essay questions
													</li>
												)}
												{mockTest.category === "speaking" && (
													<li>
														{getQuestionTypeCount("speaking")} speaking
														questions
													</li>
												)}
												{mockTest.category !== "speaking" && (
													<li>
														{getQuestionTypeCount("short_answer")} short answer
														questions
													</li>
												)}
											</ul>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setStartDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleStartTest}>Start Now</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
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

			<Card>
				<CardHeader>
					<CardTitle>What to Expect</CardTitle>
					<CardDescription>
						Prepare for your {mockTest.category} test with these tips
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{mockTest.category === "reading" && (
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Reading Test Format</h3>
								<p>
									The reading test assesses your ability to understand written
									English. You will be presented with passages and asked to
									answer questions about them.
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Tips for Success
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Skim the passage first to get a general idea</li>
												<li>Read questions carefully before answering</li>
												<li>
													Look for keywords in both questions and passages
												</li>
												<li>Manage your time effectively</li>
												<li>Don't spend too long on any single question</li>
											</ul>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Common Question Types
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Multiple choice questions</li>
												<li>Fill in the blanks</li>
												<li>Matching headings to paragraphs</li>
												<li>True/False/Not Given statements</li>
												<li>Short answer questions</li>
											</ul>
										</CardContent>
									</Card>
								</div>
							</div>
						)}

						{mockTest.category === "listening" && (
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Listening Test Format</h3>
								<p>
									The listening test assesses your ability to understand spoken
									English. You will listen to audio recordings and answer
									questions about what you hear.
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Tips for Success
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Read the questions before the audio plays</li>
												<li>Take notes while listening</li>
												<li>Pay attention to signpost words</li>
												<li>Listen for specific details</li>
												<li>Check your spelling in your answers</li>
											</ul>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Common Question Types
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Multiple choice questions</li>
												<li>Fill in the blanks</li>
												<li>Matching speakers to statements</li>
												<li>Labeling diagrams or maps</li>
												<li>Short answer questions</li>
											</ul>
										</CardContent>
									</Card>
								</div>
							</div>
						)}

						{mockTest.category === "writing" && (
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Writing Test Format</h3>
								<p>
									The writing test assesses your ability to write in English.
									You will be asked to complete writing tasks such as essays or
									reports.
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Tips for Success
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Plan your response before writing</li>
												<li>
													Use a clear structure with introduction, body, and
													conclusion
												</li>
												<li>
													Use a variety of vocabulary and sentence structures
												</li>
												<li>Stay on topic and address all parts of the task</li>
												<li>Leave time to review and edit your work</li>
											</ul>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Common Task Types
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Essay writing</li>
												<li>Letter or email composition</li>
												<li>Report writing</li>
												<li>Describing charts or graphs</li>
												<li>Argumentative writing</li>
											</ul>
										</CardContent>
									</Card>
								</div>
							</div>
						)}

						{mockTest.category === "speaking" && (
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Speaking Test Format</h3>
								<p>
									The speaking test assesses your ability to communicate in
									spoken English. You will be asked to speak on various topics
									and respond to questions.
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Tips for Success
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Speak clearly and at a natural pace</li>
												<li>
													Use a variety of vocabulary and sentence structures
												</li>
												<li>Organize your thoughts before speaking</li>
												<li>Provide examples to support your points</li>
												<li>Practice speaking on a variety of topics</li>
											</ul>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Common Task Types
											</CardTitle>
										</CardHeader>
										<CardContent>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>Introduction and interview</li>
												<li>Individual long turn</li>
												<li>Two-way discussion</li>
												<li>Describing images or situations</li>
												<li>Expressing and justifying opinions</li>
											</ul>
										</CardContent>
									</Card>
								</div>
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button
						variant="outline"
						onClick={() => setStartDialogOpen(true)}
						disabled={!isTestAvailable()}
					>
						{isTestAvailable()
							? "I'm Ready to Start"
							: "Test Not Available Yet"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
