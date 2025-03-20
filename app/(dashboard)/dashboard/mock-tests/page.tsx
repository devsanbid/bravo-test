"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth_store";
import { getAllMockTests } from "@/controllers/MockTestController";
import type { MockTest } from "@/lib/types/mock-test";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	FileText,
	Headphones,
	PenTool,
	Mic,
	Search,
	Calendar,
	Clock,
} from "lucide-react";
import type { UserDataInterface } from "@/lib/type";

export default function MockTestsPage() {
	const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [user, setUser] = useState<UserDataInterface | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const router = useRouter();
	const { getCurrentUser } = useAuthStore();

	useEffect(() => {
		fetchMockTests();
	}, []);

	const fetchMockTests = async () => {
		try {
			setLoading(true);
      const user = await getCurrentUser();
      if(user){
        setUser(user)
      }
			const tests = await getAllMockTests();
			console.log("test all = ", tests);
			const activeTests = (tests as MockTest[]).filter((test) => test.isActive);
			setMockTests(activeTests);
		} catch (error) {
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
				return null;
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Available now";
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	const filteredTests = () => {
		let filtered = mockTests;

		// Filter by category
		if (activeTab !== "all") {
			filtered = filtered.filter((test) => test.category === activeTab);
		}

		// Filter by search query
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(test) =>
					test.title.toLowerCase().includes(query) ||
					test.description.toLowerCase().includes(query),
			);
		}

		return filtered;
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

	return (
		<div className="container mx-auto py-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold">Mock Tests</h1>
					<p className="text-muted-foreground">
						Practice with our mock tests to improve your skills
					</p>
				</div>
				<div className="relative w-full md:w-64">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search tests..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<Tabs defaultValue="all" onValueChange={setActiveTab}>
				<TabsList className="grid grid-cols-5 mb-6">
					<TabsTrigger value="all">All Tests</TabsTrigger>
					<TabsTrigger value="reading">Reading</TabsTrigger>
					<TabsTrigger value="listening">Listening</TabsTrigger>
					<TabsTrigger value="writing">Writing</TabsTrigger>
					<TabsTrigger value="speaking">Speaking</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab}>
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<p>Loading mock tests...</p>
						</div>
					) : filteredTests().length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No mock tests found.</p>
							{searchQuery && (
								<p className="text-sm mt-2">Try adjusting your search query.</p>
							)}
							{!searchQuery && activeTab !== "all" && (
								<p className="text-sm mt-2">
									No {activeTab} tests are currently available.
								</p>
							)}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTests().map((test) => (
								<Card key={test.id} className="overflow-hidden flex flex-col">
									<div
										className={`h-2 w-full ${
											test.category === "reading"
												? "bg-blue-500"
												: test.category === "listening"
													? "bg-green-500"
													: test.category === "writing"
														? "bg-purple-500"
														: "bg-orange-500"
										}`}
									/>
									<CardHeader className="pb-2">
										<div className="flex justify-between items-start">
											<div className="flex items-center gap-2">
												<div
													className={`p-2 rounded-full ${
														test.category === "reading"
															? "bg-blue-100 text-blue-700"
															: test.category === "listening"
																? "bg-green-100 text-green-700"
																: test.category === "writing"
																	? "bg-purple-100 text-purple-700"
																	: "bg-orange-100 text-orange-700"
													}`}
												>
													{getCategoryIcon(test.category)}
												</div>
												<CardTitle className="text-lg">{test.title}</CardTitle>
											</div>
											<Badge className="capitalize">{test.category}</Badge>
										</div>
										<CardDescription className="line-clamp-2 mt-2">
											{test.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="flex-1">
										<div className="space-y-2 text-sm">
											<div className="flex items-center">
												<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
												<span>{test.duration} minutes</span>
											</div>
											<div className="flex items-center">
												<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
												<span>{formatDate(test.scheduledDate)}</span>
											</div>
											<div className="flex items-center font-medium">
												<span>Total Marks: {test.totalMarks}</span>
											</div>
										</div>
									</CardContent>
									<CardFooter className="bg-gray-50 border-t">
										<Button
											className="w-full"
											onClick={() =>
												router.push(`/dashboard/mock-tests/${test.id}`)
											}
										>
											View Test
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
