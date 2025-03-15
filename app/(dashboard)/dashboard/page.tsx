"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BookOpen,
	Clock,
	Trophy,
	Calendar,
	TrendingUp,
	BarChart2,
	TrendingDown,
	PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart as RechartsePieChart,
	Pie,
	Cell,
} from "recharts";
import { useAuthStore } from "@/lib/stores/auth_store";
import {
	getStudentAttemptsByUserId,
	getMockTestById,
} from "@/controllers/MockTestController";
import { useEffect, useState } from "react";
import type { StudentAttempt } from "@/lib/types/mock-test";
import { getCurrentUser } from "@/controllers/AuthController";

interface AttemptWithMockTest extends StudentAttempt {
	mockTestName: string;
	mockTestCategory: string;
}

// Function to process attempt data for charts
const processAttemptsData = (attempts: AttemptWithMockTest[]) => {
	// Sort attempts by date
	const sortedAttempts = [...attempts].sort((a, b) => {
		return (
			new Date(a.completedAt || a.startedAt).getTime() -
			new Date(b.completedAt || b.startedAt).getTime()
		);
	});

	// Get the last 6 attempts for line chart
	const recentAttempts = sortedAttempts.slice(-6);

	// Line chart data - progress over time
	const lineChartData = recentAttempts.map((attempt, index) => {
		const date = new Date(attempt.completedAt || attempt.startedAt);
		return {
			name: `Test ${index + 1}`,
			score: attempt.totalScore || 0,
			date: date.toLocaleDateString(),
		};
	});

	// Calculate skill distribution for bar chart
	// Group attempts by category
	const skillScores: Record<string, { total: number; count: number }> = {
		Reading: { total: 0, count: 0 },
		Writing: { total: 0, count: 0 },
		Speaking: { total: 0, count: 0 },
		Listening: { total: 0, count: 0 },
	};

	sortedAttempts.forEach((attempt) => {
		const category = attempt.mockTestCategory;
		if (category && attempt.totalScore !== undefined) {
			if (category.includes("Reading")) {
				skillScores["Reading"].total += attempt.totalScore;
				skillScores["Reading"].count += 1;
			} else if (category.includes("Writing")) {
				skillScores["Writing"].total += attempt.totalScore;
				skillScores["Writing"].count += 1;
			} else if (category.includes("Speaking")) {
				skillScores["Speaking"].total += attempt.totalScore;
				skillScores["Speaking"].count += 1;
			} else if (category.includes("Listening")) {
				skillScores["Listening"].total += attempt.totalScore;
				skillScores["Listening"].count += 1;
			}
		}
	});

	// Calculate average scores for each skill
	const barChartData = Object.entries(skillScores).map(([skill, data]) => ({
		skill,
		score: data.count > 0 ? +(data.total / data.count).toFixed(1) : 0,
	}));

	// Calculate completion status for pie chart
	const completedCount = sortedAttempts.filter(
		(a) => a.status === "completed",
	).length;
	const inProgressCount = sortedAttempts.filter(
		(a) => a.status === "in_progress",
	).length;
	const totalTests = attempts.length;

	const pieChartData = [
		{ name: "Completed", value: completedCount },
		{ name: "In Progress", value: inProgressCount },
		{
			name: "Not Started",
			value: Math.max(0, totalTests - completedCount - inProgressCount),
		},
	];

	return { lineChartData, barChartData, pieChartData };
};

const COLORS = ["#f97316", "#4B0082", "#6E59A5"];

const Reports = ({ attempts }: { attempts: AttemptWithMockTest[] }) => {
	const { pieChartData } = processAttemptsData(attempts);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PieChart className="h-5 w-5 text-brand-orange" />
							Course Completion Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<RechartsePieChart>
									<Pie
										data={pieChartData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										fill="#8884d8"
										paddingAngle={5}
										dataKey="value"
									>
										{pieChartData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</RechartsePieChart>
							</ResponsiveContainer>
						</div>
						<div className="flex justify-center gap-4 mt-4">
							{pieChartData.map((entry, index) => (
								<div key={entry.name} className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: COLORS[index] }}
									/>
									<span className="text-sm">{entry.name}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingDown className="h-5 w-5 text-brand-orange" />
							Areas for Improvement
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{ skill: "Grammar Usage", score: 65 },
								{ skill: "Vocabulary Range", score: 72 },
								{ skill: "Speaking Fluency", score: 68 },
								{ skill: "Writing Structure", score: 70 },
							].map((item) => (
								<div key={item.skill} className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">{item.skill}</span>
										<span className="text-sm text-muted-foreground">
											{item.score}%
										</span>
									</div>
									<div className="h-2 rounded-full bg-gray-100">
										<div
											className="h-full rounded-full bg-brand-orange"
											style={{ width: `${item.score}%` }}
										/>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

const Analytics = ({ attempts }: { attempts: AttemptWithMockTest[] }) => {
	const { lineChartData, barChartData } = processAttemptsData(attempts);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-brand-orange" />
							Progress Over Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={lineChartData}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="score"
										stroke="#f97316"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart2 className="h-5 w-5 text-brand-orange" />
							Skill Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={barChartData}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="skill" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="score" fill="#4B0082" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default function DashboardPage() {
	const router = useRouter();
	//const { getCurrentUser } = useAuthStore();
	const [attempts, setAttempts] = useState<AttemptWithMockTest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAttempts = async () => {
			try {
				const user = await getCurrentUser();
				console.log("Current user on dashboard:", user);


				if (user && user.userId) {
					console.log("User found with ID:", user.userId);
					const studentId = user.userId;

					// Fetch attempts only if studentId is defined
					if (studentId) {
						console.log("Fetching attempts for studentId:", studentId);
						const attemptsData = await getStudentAttemptsByUserId(studentId);
						console.log("Raw attempts data received:", attemptsData);
						console.log("Number of attempts found:", attemptsData?.length || 0);

						// Process attempts only if we got data back
						if (attemptsData && attemptsData.length > 0) {
							console.log("Processing attempts with mock test data...");
							const attemptsWithMockTest: AttemptWithMockTest[] =
								await Promise.all(
									attemptsData.map(async (attempt) => {
										console.log("Processing attempt:", attempt);
										console.log("Attempt mockTestId:", attempt.mockTestId);
										const mockTest = await getMockTestById(attempt.mockTestId);
										console.log("Mock test data:", mockTest);
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
											mockTestCategory: mockTest.category,
										};
									}),
								);
							console.log(
								"Processed attempts with mock test data:",
								attemptsWithMockTest,
							);
							setAttempts(attemptsWithMockTest);
						} else {
							// If no attempts found, set empty array
							console.log("No attempts found, setting empty array");
							setAttempts([]);
						}
					}
				} else {
					// If no user, set empty array for attempts
					console.log("No user or user ID, setting empty array for attempts");
					setAttempts([]);
				}
			} catch (error: any) {
				console.error("Error fetching attempts:", error);
				console.error("Error stack:", error.stack);
				setError(error.message);
			} finally {
				setLoading(false);
				console.log("Finished fetching attempts, loading set to false");
			}
		};
		console.log("Dashboard component mounted, calling fetchAttempts");
		fetchAttempts();
	}, []);

	// Calculate stats for overview cards
	const calculateStats = () => {
		console.log("Calculating stats from attempts:", attempts);

		if (!attempts || attempts.length === 0) {
			console.log("No attempts data, returning zero stats");
			return {
				totalTests: 0,
				averageScore: 0,
				completedTests: 0,
				inProgressTests: 0,
			};
		}

		const completedAttempts = attempts.filter((a) => a.status === "completed");
		console.log("Completed attempts:", completedAttempts);

		const totalScore = completedAttempts.reduce(
			(sum, a) => sum + (a.totalScore || 0),
			0,
		);
		console.log("Total score from completed attempts:", totalScore);

		const averageScore =
			completedAttempts.length > 0
				? (totalScore / completedAttempts.length).toFixed(1)
				: 0;
		console.log("Calculated average score:", averageScore);

		const inProgressTests = attempts.filter(
			(a) => a.status === "in_progress",
		).length;
		console.log("In-progress tests:", inProgressTests);

		const result = {
			totalTests: attempts.length,
			averageScore,
			completedTests: completedAttempts.length,
			inProgressTests,
		};

		console.log("Final stats:", result);
		return result;
	};

	const stats = calculateStats();

	// Calculate skill scores for progress bars
	const calculateSkillScores = () => {
		if (!attempts || attempts.length === 0) {
			return {
				reading: { score: 0, percentage: 0 },
				writing: { score: 0, percentage: 0 },
				speaking: { score: 0, percentage: 0 },
				listening: { score: 0, percentage: 0 },
			};
		}

		const { barChartData } = processAttemptsData(attempts);

		const getSkillData = (skillName: string) => {
			const skill = barChartData.find((item) => item.skill === skillName);
			const score = skill ? skill.score : 0;
			// Convert score to percentage (assuming max score is 10)
			const percentage = score * 10;
			return { score, percentage };
		};

		return {
			reading: getSkillData("Reading"),
			writing: getSkillData("Writing"),
			speaking: getSkillData("Speaking"),
			listening: getSkillData("Listening"),
		};
	};

	const skillScores = calculateSkillScores();

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
		<div className="h-full p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-gray-500">
						Welcome back to your learning dashboard
					</p>
				</div>
				<Button
					className="bg-brand-orange hover:bg-brand-orange/90"
					onClick={() => router.push("https://ielts.org/test-centres")}
				>
					Book a Test
				</Button>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card className="p-4">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-orange-100 rounded-lg">
									<BookOpen className="h-6 w-6 text-brand-orange" />
								</div>
								<div>
									<p className="text-sm text-gray-500">Total Practice Tests</p>
									<div className="flex items-end gap-2">
										<h2 className="text-2xl font-bold">{stats.totalTests}</h2>
										<span className="text-xs text-green-500">
											{stats.completedTests} completed
										</span>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-purple-100 rounded-lg">
									<Clock className="h-6 w-6 text-brand-purple" />
								</div>
								<div>
									<p className="text-sm text-gray-500">Tests In Progress</p>
									<div className="flex items-end gap-2">
										<h2 className="text-2xl font-bold">
											{stats.inProgressTests}
										</h2>
										<span className="text-xs text-amber-500">
											{stats.inProgressTests > 0
												? "Continue your tests"
												: "All tests completed"}
										</span>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-orange-100 rounded-lg">
									<Trophy className="h-6 w-6 text-brand-orange" />
								</div>
								<div>
									<p className="text-sm text-gray-500">Average Score</p>
									<div className="flex items-end gap-2">
										<h2 className="text-2xl font-bold">{stats.averageScore}</h2>
										<span className="text-xs text-green-500">
											{Number(stats.averageScore) >= 7
												? "Excellent!"
												: "Keep improving!"}
										</span>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-purple-100 rounded-lg">
									<Calendar className="h-6 w-6 text-brand-purple" />
								</div>
								<div>
									<p className="text-sm text-gray-500">Next Test</p>
									<div className="flex items-end gap-2">
										<h2 className="text-2xl font-bold">4d</h2>
										<span className="text-sm text-gray-500">
											IELTS Mock Test
										</span>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="p-6">
							<h3 className="text-xl font-bold mb-4">Progress Overview</h3>
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Reading</span>
										<span className="text-sm text-gray-500">
											{skillScores.reading.score.toFixed(1)}
										</span>
									</div>
									<Progress
										value={skillScores.reading.percentage}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Listening</span>
										<span className="text-sm text-gray-500">
											{skillScores.listening.score.toFixed(1)}
										</span>
									</div>
									<Progress
										value={skillScores.listening.percentage}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Writing</span>
										<span className="text-sm text-gray-500">
											{skillScores.writing.score.toFixed(1)}
										</span>
									</div>
									<Progress
										value={skillScores.writing.percentage}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Speaking</span>
										<span className="text-sm text-gray-500">
											{skillScores.speaking.score.toFixed(1)}
										</span>
									</div>
									<Progress
										value={skillScores.speaking.percentage}
										className="bg-gray-100 h-2"
									/>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="text-xl font-bold mb-4">Recent Test Attempts</h3>
							{attempts.length === 0 ? (
								<p className="text-sm text-gray-500 mb-4">
									You haven't taken any tests yet
								</p>
							) : (
								<div className="space-y-4">
									{attempts.slice(-3).map((attempt) => (
										<div
											key={attempt.id}
											className="flex items-center justify-between"
										>
											<div>
												<h4 className="font-medium">
													{attempt.mockTestName || "Mock Test"}
												</h4>
												<p className="text-sm text-gray-500">
													{new Date(
														attempt.completedAt || attempt.startedAt,
													).toLocaleDateString()}
												</p>
											</div>
											<Badge
												className={
													attempt.status === "completed"
														? "bg-green-100 text-green-800 hover:bg-green-100"
														: "bg-amber-100 text-amber-800 hover:bg-amber-100"
												}
											>
												{attempt.status === "completed"
													? `${attempt.percentageScore || 0}%`
													: "In Progress"}
											</Badge>
										</div>
									))}
									{attempts.length > 3 && (
										<Button
											variant="outline"
											className="w-full mt-2"
											onClick={() => router.push("/dashboard/mock-tests")}
										>
											View All Tests
										</Button>
									)}
								</div>
							)}
						</Card>
					</div>
				</TabsContent>
				<TabsContent value="analytics" className="space-y-6">
					<Analytics attempts={attempts} />
				</TabsContent>

				<TabsContent value="reports" className="space-y-6">
					<Reports attempts={attempts} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
