"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import {
	getMockTestById,
	createQuestion,
} from "@/controllers/MockTestController";
import {
	MockTest,
	Question,
	QuestionType,
	QuestionOption,
} from "@/lib/types/mock-test";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react";
import { ID } from "@/lib/appwrite/config";

// Define the form schema based on question type
const baseQuestionSchema = z.object({
	questionText: z
		.string()
		.min(3, "Question text must be at least 3 characters"),
	questionType: z.enum([
		"multiple_choice",
		"fill_blank",
		"essay",
		"speaking",
		"short_answer",
	]),
	marks: z.coerce.number().min(1, "Marks must be at least 1"),
	order: z.coerce.number().min(1, "Order must be at least 1"),
	timeLimit: z.coerce.number().optional(),
	instructions: z.string().optional(),
	questionImage: z.string().optional(),
	audioUrl: z.string().optional(),
	correctAnswer: z.string().optional().default(""),
});

const multipleChoiceSchema = baseQuestionSchema.extend({
	options: z
		.array(
			z.object({
				id: z.string(),
				text: z.string().min(1, "Option text is required"),
				isCorrect: z.boolean().default(false),
				image: z.string().optional(),
			}),
		)
		.min(2, "At least 2 options are required"),
});

const fillBlankSchema = baseQuestionSchema.extend({
	correctAnswer: z.union([
		z.string().min(1, "Answer is required"),
		z.array(z.string()).min(1, "At least one answer is required"),
	]),
});

const essaySchema = baseQuestionSchema;

const speakingSchema = baseQuestionSchema;

const shortAnswerSchema = baseQuestionSchema.extend({
	correctAnswer: z.union([
		z.string().min(1, "Answer is required"),
		z.array(z.string()).min(1, "At least one answer is required"),
	]),
});

// Create a discriminated union type for the form values
type FormValues =
	| (z.infer<typeof multipleChoiceSchema> & { questionType: "multiple_choice" })
	| (z.infer<typeof fillBlankSchema> & { questionType: "fill_blank" })
	| (z.infer<typeof essaySchema> & { questionType: "essay" })
	| (z.infer<typeof speakingSchema> & { questionType: "speaking" })
	| (z.infer<typeof shortAnswerSchema> & { questionType: "short_answer" });

export default function CreateQuestionPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [mockTest, setMockTest] = useState<MockTest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionType, setQuestionType] =
		useState<QuestionType>("multiple_choice");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, checkUser } = useAuthStore();

    // Get the question type from the URL query parameter
    useEffect(() => {
		const typeParam = searchParams.get("type") as QuestionType | null;
		if (
			typeParam &&
			[
				"multiple_choice",
				"fill_blank",
				"essay",
				"speaking",
				"short_answer",
			].includes(typeParam)
		) {
			setQuestionType(typeParam);
		}
	}, [searchParams]);

    // Fetch the mock test
    useEffect(() => {
		if (params.id) {
			fetchMockTest();
		}
	}, [params.id]);

    const fetchMockTest = async () => {
		await checkUser();
		try {
			const test = await getMockTestById(params.id);
			setMockTest(test as MockTest);
		} catch (error) {
			console.error("Error fetching mock test:", error);
			toast.error("Failed to load mock test");
		}
	};

    // Create the form with the appropriate schema based on question type
    const form = useForm<FormValues>({
		resolver: zodResolver(
			questionType === "multiple_choice"
				? multipleChoiceSchema
				: questionType === "fill_blank"
					? fillBlankSchema
					: questionType === "essay"
						? essaySchema
						: questionType === "speaking"
							? speakingSchema
							: shortAnswerSchema,
		),
		defaultValues: {
			questionText: "",
			questionType,
			marks: 1,
			order: 1,
			timeLimit: undefined,
			instructions: "",
			questionImage: "",
			audioUrl: "",
			...(questionType === "multiple_choice" && {
				options: [
					{ id: ID.unique(), text: "", isCorrect: false },
					{ id: ID.unique(), text: "", isCorrect: false },
				],
			}),
			...(questionType === "fill_blank" && {
				correctAnswer: "",
			}),
			...(questionType === "short_answer" && {
				correctAnswer: "",
			}),
		} as any,
	});

    // Use field array for multiple choice options
    const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "options" as any,
	});

    // Update form when question type changes
    useEffect(() => {
		form.reset({
			questionText: form.getValues("questionText"),
			questionType,
			marks: form.getValues("marks"),
			order: form.getValues("order"),
			timeLimit: form.getValues("timeLimit"),
			instructions: form.getValues("instructions"),
			questionImage: form.getValues("questionImage"),
			audioUrl: form.getValues("audioUrl"),
			correctAnswer: form.getValues("correctAnswer") || "",
			...(questionType === "multiple_choice" && {
				options:
					fields.length > 0
						? fields
						: [
								{ id: ID.unique(), text: "", isCorrect: false },
								{ id: ID.unique(), text: "", isCorrect: false },
							],
			}),
		} as any);
	}, [questionType]);

    const onSubmit = async (values: FormValues) => {
		if (!user) {
			toast.error("You must be logged in to create a question");
			return;
		}

		if (!mockTest) {
			toast.error("Mock test not found");
			return;
		}

		try {
			setIsSubmitting(true);

			// Prepare the question data based on question type
			let correctAnswer = "";

			// For multiple_choice, find the correct option(s)
			if (values.questionType === "multiple_choice") {
				const correctOptions = values.options
					.filter((option) => option.isCorrect)
					.map((option) => option.text);

				correctAnswer = correctOptions.join(", ");
			} else if (
				values.questionType === "fill_blank" ||
				values.questionType === "short_answer"
			) {
				correctAnswer = Array.isArray((values as any).correctAnswer)
					? (values as any).correctAnswer.join(", ")
					: (values as any).correctAnswer || "";
			}

			const questionData: Omit<Question, "id"> = {
				mockTestId: params.id,
				questionType: values.questionType,
				questionText: values.questionText,
				marks: values.marks,
				order: values.order,
				...(values.timeLimit && { timeLimit: values.timeLimit }),
				...(values.instructions && { instructions: values.instructions }),
				...(values.questionImage && { questionImage: values.questionImage }),
				...(values.audioUrl && { audioUrl: values.audioUrl }),
				// Always include correctAnswer, empty string for essay/speaking
				correctAnswer,
				// Only include options for multiple choice
				...(values.questionType === "multiple_choice" && {
					options: values.options.map((option: any) =>
						JSON.stringify({
							id: option.id,
							text: option.text,
							isCorrect: option.isCorrect,
						}),
					),
				}),
			};

			console.log("questionData = ", questionData);
			await createQuestion(questionData);
			toast.success("Question created successfully");
			router.push(`/mod/mock-tests/${params.id}`);
		} catch (error) {
			console.error("Error creating question:", error);
			toast.error("Failed to create question");
		} finally {
			setIsSubmitting(false);
		}
	};

    const handleAddOption = () => {
		append({ id: ID.unique(), text: "", isCorrect: false });
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
				<Button variant="ghost" onClick={() => router.back()} className="mr-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<h1 className="text-3xl font-bold">Add Question to {mockTest.title}</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Question Details</CardTitle>
					<CardDescription>
						Create a new{" "}
						{questionType
							.split("_")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" ")}{" "}
						question for this test.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="questionType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Question Type</FormLabel>
											<Select
												onValueChange={(value) => {
													field.onChange(value);
													setQuestionType(value as QuestionType);
												}}
												defaultValue={field.value}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a question type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="multiple_choice">
														Multiple Choice
													</SelectItem>
													<SelectItem value="fill_blank">
														Fill in the Blanks
													</SelectItem>
													<SelectItem value="essay">Essay</SelectItem>
													{mockTest.category === "speaking" && (
														<SelectItem value="speaking">Speaking</SelectItem>
													)}
													{mockTest.category !== "speaking" && (
														<SelectItem value="short_answer">
															Short Answer
														</SelectItem>
													)}
												</SelectContent>
											</Select>
											<FormDescription>
												The type of question to create
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="marks"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Marks</FormLabel>
												<FormControl>
													<Input type="number" min={1} {...field} />
												</FormControl>
												<FormDescription>
													Points for this question
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="order"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Order</FormLabel>
												<FormControl>
													<Input type="number" min={1} {...field} />
												</FormControl>
												<FormDescription>Question sequence</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<FormField
								control={form.control}
								name="questionText"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Question Text</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter your question here"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="questionImage"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Question Image URL (Optional)</FormLabel>
											<FormControl>
												<div className="flex">
													<Input placeholder="Enter image URL" {...field} />
													<Button
														type="button"
														variant="outline"
														className="ml-2"
														onClick={() => {
															// In a real app, you would implement file upload here
															toast.info(
																"File upload would be implemented here",
															);
														}}
													>
														<Upload className="h-4 w-4" />
													</Button>
												</div>
											</FormControl>
											<FormDescription>
												URL to an image for this question
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{(mockTest.category === "listening" ||
									mockTest.category === "speaking") && (
									<FormField
										control={form.control}
										name="audioUrl"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Audio URL{" "}
													{mockTest.category === "listening"
														? "(Required)"
														: "(Optional)"}
												</FormLabel>
												<FormControl>
													<div className="flex">
														<Input placeholder="Enter audio URL" {...field} />
														<Button
															type="button"
															variant="outline"
															className="ml-2"
															onClick={() => {
																// In a real app, you would implement file upload here
																toast.info(
																	"Audio upload would be implemented here",
																);
															}}
														>
															<Upload className="h-4 w-4" />
														</Button>
													</div>
												</FormControl>
												<FormDescription>
													URL to an audio file for this question
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							<FormField
								control={form.control}
								name="timeLimit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Time Limit (Optional, in seconds)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={5}
												placeholder="e.g., 60 for 1 minute"
												{...field}
												value={field.value || ""}
												onChange={(e) => {
													const value = e.target.value;
													field.onChange(
														value === "" ? undefined : parseInt(value),
													);
												}}
											/>
										</FormControl>
										<FormDescription>
											Time limit for answering this question (leave empty for no
											limit)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="instructions"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Instructions (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter instructions for this question"
												className="min-h-[80px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Additional instructions for this question
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Question type specific fields */}
							{questionType === "multiple_choice" && (
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<h3 className="text-lg font-medium">Options</h3>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleAddOption}
										>
											<Plus className="h-4 w-4 mr-2" /> Add Option
										</Button>
									</div>

									{fields.map((field, index) => (
										<div key={field.id} className="flex items-start space-x-2">
											<div className="flex-1 space-y-2 border p-4 rounded-md">
												<div className="flex items-center justify-between">
													<h4 className="font-medium">
														Option {String.fromCharCode(65 + index)}
													</h4>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => remove(index)}
														disabled={fields.length <= 2}
													>
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</div>

												<FormField
													control={form.control}
													name={`options.${index}.text` as any}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Text</FormLabel>
															<FormControl>
																<Input placeholder="Option text" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`options.${index}.isCorrect` as any}
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={field.onChange}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	This is the correct answer
																</FormLabel>
															</div>
														</FormItem>
													)}
												/>
											</div>
										</div>
									))}
								</div>
							)}

							{(questionType === "fill_blank" ||
								questionType === "short_answer") && (
								<FormField
									control={form.control}
									name="correctAnswer"
									as
									any
									render={({ field }) => (
										<FormItem>
											<FormLabel>Correct Answer(s)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter the correct answer(s). For multiple acceptable answers, separate with commas."
													className="min-h-[80px]"
													{...field}
													onChange={(e) => {
														// Handle both string and array cases
														const value = e.target.value;
														if (value.includes(",")) {
															field.onChange(
																value.split(",").map((v) => v.trim()),
															);
														} else {
															field.onChange(value);
														}
													}}
													value={
														Array.isArray(field.value)
															? field.value.join(", ")
															: field.value
													}
												/>
											</FormControl>
											<FormDescription>
												{questionType === "fill_blank"
													? "The correct answer(s) for the blank(s). For multiple blanks, separate answers with commas."
													: "The expected answer(s). For multiple acceptable answers, separate with commas."}
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<div className="flex justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									className="mr-2"
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										"Creating..."
									) : (
										<>
											<Save className="mr-2 h-4 w-4" /> Create Question
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
