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
import { LogoutButton } from "@/components/main/LogoutButton";
import { useAuthStore } from "@/lib/stores/authStore";
import { getStudentAttemptsByUserId, getMockTestById } from "@/controllers/MockTestController";
import { useEffect, useState } from "react";
import { StudentAttempt } from "@/lib/types/mock-test";

interface AttemptWithMockTest extends StudentAttempt {
    mockTestName: string;
    mockTestCategory: string;
}

const lineChartData = [
	{ name: "Week 1", score: 6.5 },
	{ name: "Week 2", score: 7.0 },
	{ name: "Week 3", score: 6.8 },
	{ name: "Week 4", score: 7.5 },
	{ name: "Week 5", score: 7.2 },
	{ name: "Week 6", score: 7.8 },
];

const barChartData = [
	{ skill: "Reading", score: 8.0 },
	{ skill: "Writing", score: 7.5 },
	{ skill: "Speaking", score: 7.0 },
	{ skill: "Listening", score: 7.8 },
];

const pieChartData = [
	{ name: "Completed", value: 65 },
	{ name: "In Progress", value: 25 },
	{ name: "Not Started", value: 10 },
];

const COLORS = ["#f97316", "#4B0082", "#6E59A5"];

const Reports = () => (
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

const Analytics = () => (
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

export default function DashboardPage() {
	const router = useRouter();
    const { user,checkUser } = useAuthStore();
    const [attempts, setAttempts] = useState<AttemptWithMockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttempts = async() => {

            try{
                if(!user) {
                await checkUser();
                }
                if(user){
                    const studentId = user.id;

                    const attemptsData = await getStudentAttemptsByUserId(studentId);

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
                    )
                    setAttempts(attemptsWithMockTest);
                }


            } catch (error: any) {
                setError(error.message);

            } finally {
                setLoading(false)
            }
        }
        fetchAttempts();
    }, [])

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
										<h2 className="text-2xl font-bold">24</h2>
										<span className="text-xs text-green-500">
											+2 from last week
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
									<p className="text-sm text-gray-500">Study Hours</p>
									<div className="flex items-end gap-2">
										<h2 className="text-2xl font-bold">56h</h2>
										<span className="text-xs text-green-500">
											+8h from last week
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
										<h2 className="text-2xl font-bold">7.5</h2>
										<span className="text-xs text-green-500">
											+0.5 from last test
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
										<span className="text-sm text-gray-500">8.0</span>
									</div>
									<Progress
										value={80}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Listening</span>
										<span className="text-sm text-gray-500">7.5</span>
									</div>
									<Progress
										value={75}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Writing</span>
										<span className="text-sm text-gray-500">6.5</span>
									</div>
									<Progress
										value={65}
										className="bg-gray-100 h-2"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">Speaking</span>
										<span className="text-sm text-gray-500">7.0</span>
									</div>
									<Progress
										value={70}
										className="bg-gray-100 h-2"
									/>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="text-xl font-bold mb-4">Upcoming Tests</h3>
							<p className="text-sm text-gray-500 mb-4">
								You have 3 tests scheduled this week
							</p>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">IELTS Mock Test</h4>
										<p className="text-sm text-gray-500">Thursday, 2:00 PM</p>
									</div>
									<Badge className="bg-purple-100 text-brand-purple hover:bg-purple-100">
										Academic
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">PTE Practice</h4>
										<p className="text-sm text-gray-500">Friday, 10:00 AM</p>
									</div>
									<Badge className="bg-orange-100 text-brand-orange hover:bg-orange-100">
										General
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Speaking Session</h4>
										<p className="text-sm text-gray-500">Saturday, 3:30 PM</p>
									</div>
									<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
										One-on-One
									</Badge>
								</div>
							</div>
						</Card>
					</div>
				</TabsContent>
				<TabsContent value="analytics" className="space-y-6">

				</TabsContent>

				<TabsContent value="reports" className="space-y-6">

				</TabsContent>
			</Tabs>
		</div>
	);
}
