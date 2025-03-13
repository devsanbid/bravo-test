"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Info, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verificationSchema = z.object({
  code1: z.string().length(1, "Required"),
  code2: z.string().length(1, "Required"),
  code3: z.string().length(1, "Required"),
  code4: z.string().length(1, "Required"),
  code5: z.string().length(1, "Required"),
  code6: z.string().length(1, "Required"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code1: "",
      code2: "",
      code3: "",
      code4: "",
      code5: "",
      code6: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {

  }

  async function onVerificationSubmit(values: z.infer<typeof verificationSchema>) {
    // In a real implementation, you would verify the code here
    setStep(3);
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
  }

  // Handle input focus for verification code
  const handleVerificationInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length === 1 && index < 6) {
      const nextInput = document.querySelector<HTMLInputElement>(`input[name=code${index + 1}]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

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
                    <span className="text-brand-purple">Reset Your</span>{" "}
                    <span className="text-brand-orange">Password</span>
                  </h1>
                  <p className="text-brand-purple/80 max-w-sm">
                    Don&apos;t worry! It happens. Please enter the email associated with your account.
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
                <p className="text-sm text-brand-purple/80">Need help? Contact our support team at support@bie.edu</p>
              </div>
            </div>

            {/* Right Column - Form Section */}
            <div className="lg:col-span-3 flex items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-md space-y-8">
                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 1 ? "bg-brand-orange text-white" : "bg-gray-200"
                        }`}
                      >
                        {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${step > 1 ? "bg-brand-orange" : "bg-gray-200"}`} />
                    </div>
                    <p className="text-xs mt-2 text-brand-purple/70">Email</p>
                  </div>
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 2 ? "bg-brand-orange text-white" : "bg-gray-200"
                        }`}
                      >
                        {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${step > 2 ? "bg-brand-orange" : "bg-gray-200"}`} />
                    </div>
                    <p className="text-xs mt-2 text-brand-purple/70">Verify</p>
                  </div>
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 3 ? "bg-brand-orange text-white" : "bg-gray-200"
                        }`}
                      >
                        3
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-brand-purple/70">Reset</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-brand-purple/5 via-brand-orange/5 to-brand-purple/5 rounded-xl p-6 sm:p-8">
                  {step === 1 && (
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <Alert className="bg-brand-purple/5 text-brand-purple border-brand-purple/20">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Enter your email address and we&apos;ll send you a verification code.
                          </AlertDescription>
                        </Alert>

                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-brand-purple">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    placeholder="john@example.com"
                                    type="email"
                                    className="h-12 pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                    </Form>
                  )}

                  {step === 2 && (
                    <Form {...verificationForm}>
                      <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-6">
                        <Alert className="bg-brand-purple/5 text-brand-purple border-brand-purple/20">
                          <Info className="h-4 w-4" />
                          <AlertDescription>Enter the 6-digit code sent to {email}</AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <FormLabel className="text-brand-purple">Verification Code</FormLabel>
                          <div className="flex gap-2 justify-between">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <FormField
                                key={num}
                                control={verificationForm.control}
                                name={`code${num}` as keyof z.infer<typeof verificationSchema>}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        maxLength={1}
                                        className="h-12 w-12 text-center text-lg"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleVerificationInput(e, num);
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white h-12"
                            disabled={isLoading}
                          >
                            {isLoading ? "Verifying..." : "Verify Code"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-brand-purple hover:text-brand-purple/80"
                            disabled={isLoading}
                          >
                            Didn&apos;t receive the code? Resend
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}

                  {step === 3 && (
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <Alert className="bg-brand-purple/5 text-brand-purple border-brand-purple/20">
                          <Info className="h-4 w-4" />
                          <AlertDescription>Create a new password for your account.</AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-brand-purple">New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input type="password" className="h-12 pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-brand-purple">Confirm New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input type="password" className="h-12 pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? "Updating..." : "Reset Password"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                    </Form>
                  )}
                </div>

                <div className="text-center">
                  <Link href="/login" className="text-brand-purple hover:text-brand-purple/80 text-sm">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
