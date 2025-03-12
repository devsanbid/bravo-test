"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Bell,
  Mail,
  Clock,
  Book,
  Globe,
  Moon,
  User,
  Share2,
  Shield,
  KeyRound,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  getUserSettings,
  updateUserProfile,
  updateUserPassword,
  updateUserSettings,
  toggleChatNotifications
} from "@/controllers/SettingsController";

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const userId = user?.$id;

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [testReminders, setTestReminders] = useState(true);
  const [studyReminders, setStudyReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [progressSharing, setProgressSharing] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load user settings
  useEffect(() => {
    async function loadSettings() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const settings = await getUserSettings(userId);
        
        if (settings) {
          // Update settings state
          setEmailNotifications(settings.emailNotifications ?? true);
          setTestReminders(settings.testReminders ?? true);
          setStudyReminders(settings.studyReminders ?? false);
          setDarkMode(settings.darkMode ?? false);
          setProfileVisibility(settings.profileVisibility ?? true);
          setProgressSharing(settings.progressSharing ?? false);
          setTwoFactor(settings.twoFactor ?? false);
          setChatNotifications(settings.chatNotifications ?? true);
          setLanguage(settings.language ?? "en");
        }
        
        // Load user profile info for the profile form
        if (user?.profile) {
          profileForm.setValue("firstName", user.profile.firstName || "");
          profileForm.setValue("lastName", user.profile.lastName || "");
          profileForm.setValue("email", user.profile.email || "");
          profileForm.setValue("phone", user.profile.phone || "");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, [userId, toast, profileForm, user]);

  // Form submit handlers
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!userId) return;
    
    try {
      setProfileSubmitting(true);
      const result = await updateUserProfile(userId, values);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditingProfile(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!userId) return;
    
    try {
      setPasswordSubmitting(true);
      const result = await updateUserPassword(userId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        passwordForm.reset();
        setIsChangingPassword(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting password change:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setPasswordSubmitting(false);
    }
  }

  // Toggle handlers
  async function handleEmailNotificationsChange(checked: boolean) {
    if (!userId) return;
    
    setEmailNotifications(checked);
    try {
      await updateUserSettings(userId, { emailNotifications: checked });
    } catch (error) {
      console.error("Error updating email notifications:", error);
      setEmailNotifications(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  }

  async function handleTestRemindersChange(checked: boolean) {
    if (!userId) return;
    
    setTestReminders(checked);
    try {
      await updateUserSettings(userId, { testReminders: checked });
    } catch (error) {
      console.error("Error updating test reminders:", error);
      setTestReminders(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  }

  async function handleStudyRemindersChange(checked: boolean) {
    if (!userId) return;
    
    setStudyReminders(checked);
    try {
      await updateUserSettings(userId, { studyReminders: checked });
    } catch (error) {
      console.error("Error updating study reminders:", error);
      setStudyReminders(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  }

  async function handleLanguageChange(value: string) {
    if (!userId) return;
    
    setLanguage(value);
    try {
      await updateUserSettings(userId, { language: value });
    } catch (error) {
      console.error("Error updating language:", error);
      setLanguage(language); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
    }
  }

  async function handleDarkModeChange(checked: boolean) {
    if (!userId) return;
    
    setDarkMode(checked);
    try {
      await updateUserSettings(userId, { darkMode: checked });
    } catch (error) {
      console.error("Error updating dark mode:", error);
      setDarkMode(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update appearance settings",
        variant: "destructive",
      });
    }
  }

  async function handleProfileVisibilityChange(checked: boolean) {
    if (!userId) return;
    
    setProfileVisibility(checked);
    try {
      await updateUserSettings(userId, { profileVisibility: checked });
    } catch (error) {
      console.error("Error updating profile visibility:", error);
      setProfileVisibility(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  }

  async function handleProgressSharingChange(checked: boolean) {
    if (!userId) return;
    
    setProgressSharing(checked);
    try {
      await updateUserSettings(userId, { progressSharing: checked });
    } catch (error) {
      console.error("Error updating progress sharing:", error);
      setProgressSharing(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  }

  async function handleTwoFactorChange(checked: boolean) {
    if (!userId) return;
    
    setTwoFactor(checked);
    try {
      await updateUserSettings(userId, { twoFactor: checked });
    } catch (error) {
      console.error("Error updating two-factor:", error);
      setTwoFactor(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    }
  }

  async function handleChatNotificationsChange(checked: boolean) {
    if (!userId) return;
    
    setChatNotifications(checked);
    try {
      await toggleChatNotifications(userId, checked);
    } catch (error) {
      console.error("Error updating chat notifications:", error);
      setChatNotifications(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update chat notification settings",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent>
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel>First Name</FormLabel>
                    <Input 
                      value={profileForm.getValues().firstName || ""} 
                      disabled 
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <FormLabel>Last Name</FormLabel>
                    <Input 
                      value={profileForm.getValues().lastName || ""} 
                      disabled 
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    value={profileForm.getValues().email || ""} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    value={profileForm.getValues().phone || ""} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={profileSubmitting}>
                    {profileSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
            >
              {isChangingPassword ? "Cancel" : "Change Password"}
            </Button>
          </CardHeader>
          <CardContent>
            {isChangingPassword ? (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={passwordSubmitting}>
                    {passwordSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    value="••••••••" 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For security reasons, your actual password is not displayed.
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your password should be at least 8 characters long and include a mix of letters, numbers, and special characters for better security.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email Notifications</span>
                </div>
                <p className="text-sm text-gray-500">Receive email about your progress</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Test Reminders</span>
                </div>
                <p className="text-sm text-gray-500">Get notified about upcoming tests</p>
              </div>
              <Switch
                checked={testReminders}
                onCheckedChange={setTestReminders}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Study Reminders</span>
                </div>
                <p className="text-sm text-gray-500">Daily study reminder notifications</p>
              </div>
              <Switch
                checked={studyReminders}
                onCheckedChange={handleStudyRemindersChange}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Chat Notifications</span>
                </div>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <Switch
                checked={chatNotifications}
                onCheckedChange={handleChatNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Language</span>
                </div>
              </div>
              <Select 
                defaultValue={language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Dark Mode</span>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Profile Visibility</span>
                </div>
                <p className="text-sm text-gray-500">Make your profile visible to others</p>
              </div>
              <Switch
                checked={profileVisibility}
                onCheckedChange={setProfileVisibility}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Progress Sharing</span>
                </div>
                <p className="text-sm text-gray-500">Share your progress with friends</p>
              </div>
              <Switch
                checked={progressSharing}
                onCheckedChange={setProgressSharing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Two-Factor Authentication</span>
                </div>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Switch
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
