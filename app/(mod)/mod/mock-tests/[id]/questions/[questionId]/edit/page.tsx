"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
	getQuestionsByMockTestId,
	updateQuestion,
} from "@/controllers/MockTestController";
import { Question } from "@/lib/types/mock-test";
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
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

// Define your form schema based on question type
const formSchema = z.object({
	questionType: z.enum(["multiple_choice", "fill_blank", "short_answer"], {
		required_error: "Please select a question type",
	}),
	questionText: z
		.string()
		.min(5, "Question text must be at least 5 characters"),
	marks: z.coerce.number().min(1, "Marks must be at least 1"),
	order: z.coerce.number().min(1, "Order must be at least 1"),
	timeLimit: z.coerce.number().optional(),
	instructions: z.string().optional(),
	questionImage: z.string().optional().nullable(),
	audioUrl: z.string().optional().nullable(),
	options: z
		.array(
			z.object({
				id: z.string(),
				text: z.string().min(1, "Option text is required"),
				isCorrect: z.boolean(),
			}),
		)
		.optional(),
	correctAnswer: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditQuestionPage(props: { params: Promise<{ id: string; questionId: string }> }) {
    const params = use(props.params);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionData, setQuestionData] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			questionType: "multiple_choice",
			questionText: "",
			marks: 1,
			order: 1,
			questionImage: "",
			audioUrl: "",
			options: [
				{ id: crypto.randomUUID(), text: "", isCorrect: false },
				{ id: crypto.randomUUID(), text: "", isCorrect: false },
				{ id: crypto.randomUUID(), text: "", isCorrect: false },
				{ id: crypto.randomUUID(), text: "", isCorrect: false },
			],
		},
	});

    useEffect(() => {
		const fetchQuestion = async () => {
			try {
				setLoading(true);
				const questions = await getQuestionsByMockTestId(params.id);
				const question = questions.find(
					(q) => q.$id === params.questionId || q.id === params.questionId,
				);

				if (question) {
					setQuestionData(question);

					// For multiple choice questions, parse options if they're stored as strings
					let options = question.options;
					if (
						question.questionType === "multiple_choice" &&
						Array.isArray(question.options)
					) {
						if (typeof question.options[0] === "string") {
							options = question.options.map((opt) => {
								try {
									return JSON.parse(opt);
								} catch (e) {
									return {
										id: crypto.randomUUID(),
										text: opt,
										isCorrect: false,
									};
								}
							});
						}
					}

					form.reset({
						questionType: question.questionType,
						questionText: question.questionText,
						marks: question.marks,
						order: question.order,
						timeLimit: question.timeLimit,
						instructions: question.instructions,
						questionImage: question.questionImage,
						audioUrl: question.audioUrl,
						options: options,
						correctAnswer: question.correctAnswer || "",
					});
				} else {
					toast.error("Question not found");
					router.push(`/mod/mock-tests/${params.id}`);
				}
			} catch (error) {
				console.error("Error fetching question:", error);
				toast.error("Failed to load question");
			} finally {
				setLoading(false);
			}
		};

		fetchQuestion();
	}, [params.id, params.questionId, router, form]);

    const questionType = form.watch("questionType");

    const addOption = () => {
		const currentOptions = form.getValues("options") || [];
		form.setValue("options", [
			...currentOptions,
			{ id: crypto.randomUUID(), text: "", isCorrect: false },
		]);
	};

    const removeOption = (index: number) => {
		const currentOptions = form.getValues("options") || [];
		form.setValue(
			"options",
			currentOptions.filter((_, i) => i !== index),
		);
	};

    const formState = form.formState;
    console.log("Form errors:", formState.errors);

    const onSubmit = async (values: FormValues) => {
		console.log("submiting.........");

		try {
			setIsSubmitting(true);

			// For multiple_choice, ensure options are stored as strings if that's what Appwrite expects
			let processedValues = { ...values };
			if (values.questionType === "multiple_choice" && values.options) {
				processedValues.options = values.options.map((option) =>
					JSON.stringify(option),
				);
			}

			await updateQuestion(params.questionId, processedValues);
			toast.success("Question updated successfully");
			router.push(`/mod/mock-tests/${params.id}/questions`);
		} catch (error) {
			console.error("Error updating question:", error);
			toast.error("Failed to update question");
		} finally {
			setIsSubmitting(false);
		}
	};

    if (loading) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<div className="flex justify-center">
							<p>Loading question data...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

    return (
		<div className="container mx-auto py-6">
			<div className="flex items-center mb-6">
				<Button variant="ghost" onClick={() => router.back()} className="mr-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<h1 className="text-3xl font-bold">Edit Question</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Question Details</CardTitle>
					<CardDescription>Edit the details of your question.</CardDescription>
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
												onValueChange={field.onChange}
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
														Fill in the Blank
													</SelectItem>
													<SelectItem value="short_answer">
														Short Answer
													</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>The type of question</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

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
												Points awarded for a correct answer
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="questionText"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Question Text</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter the question"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>The text of your question</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="order"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Order</FormLabel>
											<FormControl>
												<Input type="number" min={1} {...field} />
											</FormControl>
											<FormDescription>
												The position of this question in the test
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="timeLimit"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Time Limit (seconds, optional)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													{...field}
													value={field.value || ""}
													onChange={(e) => {
														const value =
															e.target.value === ""
																? undefined
																: parseInt(e.target.value);
														field.onChange(value);
													}}
												/>
											</FormControl>
											<FormDescription>
												Time limit for this question (if different from test
												default)
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
												placeholder="Enter instructions for this question"
												className="min-h-[80px]"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormDescription>
											Any specific instructions for this question
										</FormDescription>
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
											<FormLabel>Image URL (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter image URL"
													{...field}
													value={field.value || " "}
												/>
											</FormControl>
											<FormDescription>
												URL for an image to include with this question
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="audioUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Audio URL (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter audio URL"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormDescription>
												URL for audio to include with this question
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{questionType === "multiple_choice" && (
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<h3 className="text-lg font-medium">Answer Options</h3>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addOption}
										>
											<Plus className="h-4 w-4 mr-2" /> Add Option
										</Button>
									</div>

									{form.watch("options")?.map((_, index) => (
										<div key={index} className="flex items-start space-x-2">
											<div className="flex-grow">
												<FormField
													control={form.control}
													name={`options.${index}.text`}
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<Input
																	placeholder={`Option ${index + 1}`}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<FormField
												control={form.control}
												name={`options.${index}.isCorrect`}
												render={({ field }) => (
													<FormItem className="flex items-center space-x-2 mt-2">
														<FormControl>
															<Input
																type="checkbox"
																checked={field.value}
																onChange={field.onChange}
																className="w-4 h-4"
															/>
														</FormControl>
														<FormLabel className="text-sm font-normal">
															Correct
														</FormLabel>
													</FormItem>
												)}
											/>

											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeOption(index)}
												className="mt-2"
												disabled={form.watch("options")?.length <= 2}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							{(questionType === "fill_blank" ||
								questionType === "short_answer") && (
								<FormField
									control={form.control}
									name="correctAnswer"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Correct Answer</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter the correct answer"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormDescription>
												The correct answer for this question
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
										"Updating..."
									) : (
										<>
											<Save className="mr-2 h-4 w-4" /> Update Question
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
