"use client";

import { register } from "@/controllers/AuthController"; // Import directly
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const formSchema = z
	.object({
		firstName: z.string().min(2, "First name must be at least 2 characters"),
		middleName: z.string().optional(),
		lastName: z.string().min(2, "Last name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		gender: z.string().min(1, "Please select a gender"),
		dateOfBirth: z.date({
			required_error: "Please select a date of birth",
		}),
		phone: z.string().min(10, "Phone number must be at least 10 digits"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		service: z.string().min(1, "Please select a service"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function RegistrationForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			middleName: "",
			lastName: "",
			email: "",
			gender: "",
			phone: "",
			password: "",
			confirmPassword: "",
			service: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);
			await register(
				values.email,
				values.password,
				values.firstName,
				values.middleName || "",
				values.lastName,
				values.gender,
				values.dateOfBirth,
				values.phone,
				values.service,
			);
			
			// Show success message
			toast.success(
				"Registration successful! Please check your email to verify your account.",
			);
			
			// Redirect to login page after successful registration
			router.push("/login");
		} catch (error) {
			toast.error("Registration failed. Please try again.");
			console.error("Registration error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-brand-purple/5 to-brand-orange/5 py-6 sm:py-8 md:py-12 px-4 sm:px-6">
			<div className="max-w-[1200px] mx-auto">
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-brand-purple/10">
					<div className="grid lg:grid-cols-5 h-full">
						{/* Left Column - Logo and Image Section */}
						<div className="lg:col-span-2 relative bg-gradient-to-br from-brand-purple/10 to-brand-orange/10 p-6 lg:p-8 flex flex-col justify-between">
							<div className="space-y-6">
								<div className="space-y-4">
									<Image
										src="/logo/logo.jpg"
										alt="BIE Logo"
										width={120}
										height={60}
										className="mb-4"
									/>
									<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
										<span className="text-brand-purple">Create an</span>{" "}
										<span className="text-brand-orange">Account</span>
									</h1>
									<p className="text-brand-purple/80 max-w-sm">
										Join our community and start your learning journey today.
									</p>
								</div>
								<div className="relative aspect-square w-full max-w-sm mx-auto lg:max-w-none">
									<Image
										src="/others/office.jpg"
										alt="Students studying"
										fill
										className="object-contain"
										priority
									/>
								</div>
							</div>
							<div className="hidden lg:block mt-4">
								<p className="text-sm text-brand-purple/80">
									"Education is the passport to the future, for tomorrow belongs
									to those who prepare for it today."
								</p>
							</div>
						</div>

						{/* Right Column - Form Section */}
						<div className="lg:col-span-3 p-6 lg:p-8 space-y-6">
							<Alert className="bg-brand-purple/5 text-brand-purple border-brand-purple/20">
								<Info className="h-4 w-4" />
								<AlertDescription>
									Kindly provide your genuine information.
								</AlertDescription>
							</Alert>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4 sm:space-y-6"
								>
									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={form.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>First Name *</FormLabel>
													<FormControl>
														<Input placeholder="John" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="middleName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Middle Name</FormLabel>
													<FormControl>
														<Input placeholder="David" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name *</FormLabel>
												<FormControl>
													<Input placeholder="Doe" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email Address *</FormLabel>
													<FormControl>
														<Input
															placeholder="john@example.com"
															type="email"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="gender"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Gender *</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select gender" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="male">Male</SelectItem>
															<SelectItem value="female">Female</SelectItem>
															<SelectItem value="other">Other</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={form.control}
											name="dateOfBirth"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Date of Birth *</FormLabel>
													<div className="grid grid-cols-3 gap-2">
														<Select
															onValueChange={(day) => {
																const currentDate = field.value || new Date();
																const newDate = new Date(
																	currentDate.getFullYear(),
																	currentDate.getMonth(),
																	parseInt(day),
																);
																field.onChange(newDate);
															}}
															value={
																field.value
																	? field.value.getDate().toString()
																	: undefined
															}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Day" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{Array.from(
																	{ length: 31 },
																	(_, i) => i + 1,
																).map((day) => (
																	<SelectItem key={day} value={day.toString()}>
																		{day}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>

														<Select
															onValueChange={(month) => {
																const currentDate = field.value || new Date();
																const newDate = new Date(
																	currentDate.getFullYear(),
																	parseInt(month) - 1,
																	currentDate.getDate(),
																);
																field.onChange(newDate);
															}}
															value={
																field.value
																	? (field.value.getMonth() + 1).toString()
																	: undefined
															}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Month" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{[
																	"January",
																	"February",
																	"March",
																	"April",
																	"May",
																	"June",
																	"July",
																	"August",
																	"September",
																	"October",
																	"November",
																	"December",
																].map((month, index) => (
																	<SelectItem
																		key={month}
																		value={(index + 1).toString()}
																	>
																		{month}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>

														<Select
															onValueChange={(year) => {
																const currentDate = field.value || new Date();
																const newDate = new Date(
																	parseInt(year),
																	currentDate.getMonth(),
																	currentDate.getDate(),
																);
																field.onChange(newDate);
															}}
															value={
																field.value
																	? field.value.getFullYear().toString()
																	: undefined
															}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Year" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{Array.from(
																	{ length: 100 },
																	(_, i) => new Date().getFullYear() - i,
																).map((year) => (
																	<SelectItem
																		key={year}
																		value={year.toString()}
																	>
																		{year}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone Number *</FormLabel>
													<FormControl>
														<Input
															type="tel"
															placeholder="+977 (976) 000-0000"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Password *</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="*******"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Confirm Password *</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="*******"
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
										name="service"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Your interested service? *</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a service" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="course1">IETS</SelectItem>
														<SelectItem value="course2">SAT</SelectItem>
														<SelectItem value="course3">PTE</SelectItem>
														<SelectItem value="course4">GRE</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button
										type="submit"
										size="lg"
										className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white"
										disabled={isLoading}
									>
										{isLoading ? "Creating account..." : "Sign up as a student"}
									</Button>

									<div className="space-y-2 text-center text-sm">
										<p className="text-brand-purple/80">
											Already have an account?{" "}
											<Link
												href="/login"
												className="text-brand-orange font-medium hover:text-brand-orange/80 hover:underline"
											>
												Login
											</Link>
										</p>
									</div>
								</form>
							</Form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
