"use client";
import { useAuthStore } from "@/lib/stores/authStore";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { login, getCurrentUser } from "@/controllers/AuthController"; // Import functions directly

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export default function LoginForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { setUser } = useAuthStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);

			// Login using the controller function
			await login(values.email, values.password);
			
			// Get the updated user and check role for explicit redirect
			const currentUser = await getCurrentUser();
			
			// Explicitly redirect based on role
			if (currentUser?.profile?.role) {
				const role = currentUser.profile.role;
				console.log("Login successful, user role:", role);
				switch (role) {
					case "student":
						router.push("/dashboard");
						break;
					case "mod":
						router.push("/mod");
						break;
					case "admin":
						router.push("/admin");
						break;
					default:
						router.push("/dashboard");
				}
			} else {
				console.log("Login successful, but no role found");
				// Default redirect if role not found
				router.push("/dashboard");
			}
			
			toast.success("Login successful!");
		} catch (error) {
			toast.error("Invalid email or password");
			console.error("Login error:", error);
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
										<span className="text-brand-purple">Welcome</span>{" "}
										<span className="text-brand-orange">Back</span>
									</h1>
									<p className="text-brand-purple/80 max-w-sm">
										Sign in to continue your learning journey with us.
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
							<div className="hidden lg:block">
								<p className="text-sm text-brand-purple/80">
									"Education is not preparation for life; education is life
									itself."
								</p>
							</div>
						</div>

						{/* Right Column - Form Section */}
						<div className="lg:col-span-3 flex items-center justify-center p-6 lg:p-8">
							<div className="w-full max-w-md space-y-8">
								<Alert className="bg-brand-purple/5 text-brand-purple border-brand-purple/20">
									<Info className="h-4 w-4" />
									<AlertDescription>
										Please enter your credentials to access your account.
									</AlertDescription>
								</Alert>

								<div className="bg-gradient-to-r from-brand-purple/5 via-brand-orange/5 to-brand-purple/5 rounded-xl p-6 sm:p-8">
									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="space-y-5"
										>
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-brand-purple">
															Email Address
														</FormLabel>
														<FormControl>
															<Input
																placeholder="john@example.com"
																type="email"
																{...field}
																className="h-12"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center justify-between">
															<FormLabel className="text-brand-purple">
																Password
															</FormLabel>
															<Link
																href="/forgotpassword"
																className="text-sm text-brand-orange hover:text-brand-orange/80 hover:underline"
															>
																Forgot password?
															</Link>
														</div>
														<FormControl>
															<Input
																type="password"
																{...field}
																className="h-12"
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<Button
												type="submit"
												size="lg"
												className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white h-12 mt-6"
												disabled={isLoading}
											>
												{isLoading ? "Signing in..." : "Sign In"}
											</Button>
										</form>
									</Form>
								</div>

								<div className="space-y-6">
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-200"></div>
										</div>
										<div className="relative flex justify-center text-sm">
											<span className="px-2 bg-white text-muted-foreground">
												Or continue with
											</span>
										</div>
									</div>

									<Button
										type="button"
										variant="outline"
										size="lg"
										className="w-full h-12"
									>
										<Image
											src="/google.svg"
											alt="Google"
											width={20}
											height={20}
											className="mr-2"
										/>
										Sign in with Google
									</Button>

									<div className="text-center space-y-2">
										<p className="text-brand-purple/80 text-sm">
											Don&apos;t have an account?{" "}
											<Link
												href="/register"
												className="text-brand-orange font-medium hover:text-brand-orange/80 hover:underline"
											>
												Sign up
											</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
