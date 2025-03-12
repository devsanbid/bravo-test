"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Users,
	UserPlus,
	UserMinus,
	Activity,
	MessageSquare,
	Mail,
	Eye,
	BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const activityData = [
	{ name: "Jan", users: 400 },
	{ name: "Feb", users: 600 },
	{ name: "Mar", users: 800 },
	{ name: "Apr", users: 1000 },
	{ name: "May", users: 1200 },
	{ name: "Jun", users: 1500 },
];

const userTypeData = [
	{ name: "Active Users", value: 850 },
	{ name: "Inactive Users", value: 200 },
	{ name: "New Users", value: 450 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function AdminDashboard() {
	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<Button>Generate Report</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Users className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total Users</p>
								<h3 className="text-2xl font-bold">1,500</h3>
								<p className="text-xs text-green-600">+12% from last month</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-green-100 rounded-lg">
								<UserPlus className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">New Users</p>
								<h3 className="text-2xl font-bold">150</h3>
								<p className="text-xs text-green-600">This month</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-orange-100 rounded-lg">
								<MessageSquare className="h-6 w-6 text-orange-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Active Chats</p>
								<h3 className="text-2xl font-bold">28</h3>
								<p className="text-xs text-orange-600">Live now</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Activity className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">System Status</p>
								<h3 className="text-2xl font-bold">Active</h3>
								<p className="text-xs text-green-600">All systems normal</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>User Growth</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={activityData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="users"
										stroke="#8884d8"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={userTypeData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										fill="#8884d8"
										paddingAngle={5}
										dataKey="value"
									>
										{userTypeData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
							<div className="flex justify-center gap-6 mt-4">
								{userTypeData.map((entry, index) => (
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

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[
							{
								icon: UserPlus,
								text: "New user registration: John Doe",
								time: "5 minutes ago",
							},
							{
								icon: Mail,
								text: "Bulk notification sent to all users",
								time: "1 hour ago",
							},
							{
								icon: Eye,
								text: "Content updated: Homepage slider",
								time: "2 hours ago",
							},
							{
								icon: UserMinus,
								text: "User account deleted: Jane Smith",
								time: "3 hours ago",
							},
							{
								icon: BarChart3,
								text: "Monthly report generated",
								time: "5 hours ago",
							},
						].map((activity, index) => (
							<div
								key={index}
								className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50"
							>
								<div className="p-2 bg-gray-100 rounded-full">
									<activity.icon className="h-4 w-4 text-gray-600" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium">{activity.text}</p>
									<p className="text-xs text-gray-500">{activity.time}</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

