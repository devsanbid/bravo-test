"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data for charts
const mockTestScores = [
  { date: "Jan", reading: 7.5, listening: 7.0, writing: 6.5, speaking: 7.0 },
  { date: "Feb", reading: 7.0, listening: 7.5, writing: 7.0, speaking: 7.5 },
  { date: "Mar", reading: 8.0, listening: 7.5, writing: 7.0, speaking: 8.0 },
  { date: "Apr", reading: 8.0, listening: 8.0, writing: 7.5, speaking: 8.0 },
  { date: "May", reading: 8.5, listening: 8.0, writing: 7.5, speaking: 8.5 },
];

const studyHours = [
  { day: "Mon", hours: 4 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 5 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 4 },
  { day: "Sat", hours: 6 },
  { day: "Sun", hours: 3 },
];

const materialProgress = [
  { name: "Completed", value: 65 },
  { name: "In Progress", value: 25 },
  { name: "Not Started", value: 10 },
];

const COLORS = ["#4ade80", "#f97316", "#6b7280"];

export default function ProgressPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Progress Overview</h1>
        <p className="text-gray-500">
          Track your improvement and study activities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <h3 className="text-2xl font-bold">7.5</h3>
                <p className="text-xs text-green-600">+0.5 from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Study Hours</p>
                <h3 className="text-2xl font-bold">27h</h3>
                <p className="text-xs text-orange-600">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Materials Completed</p>
                <h3 className="text-2xl font-bold">65%</h3>
                <p className="text-xs text-blue-600">+15% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mock Tests Taken</p>
                <h3 className="text-2xl font-bold">12</h3>
                <p className="text-xs text-purple-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mock Test Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Mock Test Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTestScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 9]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reading"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="listening"
                    stroke="#4ade80"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="writing"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="speaking"
                    stroke="#a855f7"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Study Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-gray-500" />
              Skills Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Reading</span>
                <span className="text-sm text-gray-500">8.0</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Listening</span>
                <span className="text-sm text-gray-500">7.5</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Writing</span>
                <span className="text-sm text-gray-500">7.0</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Speaking</span>
                <span className="text-sm text-gray-500">7.5</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Study Materials Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-500" />
              Study Materials Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {materialProgress.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6">
                {materialProgress.map((entry, index) => (
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
    </div>
  );
}