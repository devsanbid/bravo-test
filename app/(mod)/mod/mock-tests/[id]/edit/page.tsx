"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getMockTestById, updateMockTest } from "@/controllers/MockTestController";
import { MockTest } from "@/lib/types/mock-test";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["reading", "listening", "writing", "speaking"], {
    required_error: "Please select a category",
  }),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
  isActive: z.boolean().default(false),
  scheduledDate: z.string().optional(),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      totalMarks: 100,
      isActive: false,
      instructions: "",
    },
  });

  useEffect(() => {
    const fetchMockTest = async () => {
      try {
        setIsLoading(true);
        const test = await getMockTestById(resolvedParams.id);
        // Convert the Appwrite document to our MockTest type
        const mockTestData = {
          id: test.$id,
          title: test.title,
          description: test.description,
          category: test.category,
          createdBy: test.createdBy,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt,
          isActive: test.isActive,
          scheduledDate: test.scheduledDate,
          duration: test.duration,
          totalMarks: test.totalMarks,
          instructions: test.instructions,
        } as MockTest;
        
        setMockTest(mockTestData);
        
        // Set form values from the fetched test
        form.reset({
          title: test.title,
          description: test.description,
          category: test.category,
          duration: test.duration,
          totalMarks: test.totalMarks,
          isActive: test.isActive,
          scheduledDate: test.scheduledDate || "",
          instructions: test.instructions || "",
        });
      } catch (error) {
        console.error("Error fetching mock test:", error);
        toast.error("Failed to load mock test");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMockTest();
  }, [resolvedParams.id, form]);

  const onSubmit = async (values: FormValues) => {

    try {
      setIsSubmitting(true);
      
      await updateMockTest(resolvedParams.id, {
        ...values,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success("Mock test updated successfully");
      router.push('/mod/mock-tests');
    } catch (error) {
      console.error("Error updating mock test:", error);
      toast.error("Failed to update mock test");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          <p>Loading mock test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Mock Test</h1>
      </div>

      <Card className="border border-brand-purple/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-brand-purple/5 to-brand-orange/5">
          <CardTitle>Edit Test Details</CardTitle>
          <CardDescription>
            Update the details for your mock test. Any changes will be immediately reflected for students.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for the mock test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="listening">Listening</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="speaking">Speaking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The category of the mock test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter test description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of what the test covers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} {...field} />
                      </FormControl>
                      <FormDescription>
                        How long students have to complete the test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        The maximum score possible for this test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter test instructions"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Instructions for students taking the test
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        When the test will be available to students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Make this test immediately available to students
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
