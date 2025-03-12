"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { getAllMockTests, deleteMockTest } from "@/controllers/MockTestController";
import { MockTest } from "@/lib/types/mock-test";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { PlusCircle, Edit, Trash2, Eye, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function MockTestsPage() {
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0); // Add this line - refresh key to force re-renders
  const router = useRouter();
  const { user, checkUser } = useAuthStore();

  useEffect(() => {
    fetchMockTests();
  }, [refreshKey]);

  useEffect(() => {
    const handleRouteChange = () => {
      setRefreshKey(prev => prev + 1); // Force a refresh when returning to this page
    };

    window.addEventListener('focus', handleRouteChange);
    
    return () => {
      window.removeEventListener('focus', handleRouteChange);
    };
  }, []);

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      await checkUser();
      
      const tests = await getAllMockTests();
            console.log("mock test = ", tests)
      
      if (Array.isArray(tests)) {
        setMockTests(tests);
      } else {
        console.error("Received non-array response:", tests);
        setMockTests([]);
        toast.error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching mock tests:", error);
      toast.error("Failed to load mock tests");
      setMockTests([]); // Clear mock tests on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMockTest(id);
      
      // Remove the deleted test from the state immediately
      setMockTests(prevTests => prevTests.filter(test => test.id !== id));
      
      toast.success("Mock test deleted successfully");
      
      // Force a fresh fetch to ensure state is in sync with the database
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting mock test:", error);
      toast.error("Failed to delete mock test");
    }
  };

  const filteredTests = () => {
    switch (activeTab) {
      case "reading":
      case "listening":
      case "writing":
      case "speaking":
        return mockTests.filter(test => test.category === activeTab);
      case "active":
        return mockTests.filter(test => test.isActive);
      case "scheduled":
        return mockTests.filter(test => test.scheduledDate && new Date(test.scheduledDate) > new Date());
      default:
        return mockTests;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.profile?.role !== "mod") {
    return (
      <div className="flex items-center justify-center h-screen p-10">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mock Tests Management</h1>
        <Button onClick={() => {
          router.push("/mod/mock-tests/create");
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Test
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="listening">Listening</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="speaking">Speaking</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Mock Tests</CardTitle>
              <CardDescription>
                Manage your {activeTab === "all" ? "" : activeTab} mock tests here. You can create, edit, and delete tests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading mock tests...</p>
                </div>
              ) : filteredTests().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No mock tests found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push("/mod/mock-tests/create")}
                  >
                    Create your first mock test
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all mock tests.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests().map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.title}</TableCell>
                        <TableCell className="capitalize">{test.category}</TableCell>
                        <TableCell>
                          {test.isActive ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="mr-1 h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <XCircle className="mr-1 h-4 w-4" /> Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {test.scheduledDate ? (
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" /> {formatDate(test.scheduledDate)}
                            </span>
                          ) : (
                            "Not scheduled"
                          )}
                        </TableCell>
                        <TableCell>{test.duration} mins</TableCell>
                        <TableCell>{test.totalMarks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/mod/mock-tests/${test.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/mod/mock-tests/${test.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    mock test and all associated questions and student attempts.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(test.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
