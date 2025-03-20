"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Bell,
  Mail,
  MessageCircle,
  User,
  Shield,
  KeyRound,
  Reply,
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth_store";
import { useToast } from "@/hooks/use-toast";
import {
  getUserSettings,
  updateUserProfile,
  updateUserPassword,
  updateUserSettings,
  updateModAutoReply,
  toggleChatNotifications
}from "@/controllers/SettingsController";
import { UserDataInterface } from "@/lib/type";

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

const responseTemplateSchema = z.object({
  responseTemplate: z.string().min(10, "Template must be at least 10 characters"),
});

export default function ModSettingsPage() {
  const { toast } = useToast();
  const {getCurrentUser} = useAuthStore();
  const [user,setUser] = useState<UserDataInterface | null>(null)
  const userId = user?.userId;

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Forms
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

  const responseTemplateForm = useForm<z.infer<typeof responseTemplateSchema>>({
    resolver: zodResolver(responseTemplateSchema),
    defaultValues: {
      responseTemplate: "Thank you for your message. I'll respond as soon as possible.",
    },
  });

        console.log("user",user)
  // First ensure we have user data
  useEffect(() => {
    async function run() {
      const user = await getCurrentUser()
      setUser(user)
    }
    run()
  }, []);

  // Load user settings after we have user data
  useEffect(() => {
    async function loadSettings() {
      if (!userId) {
        return;
      }
      
      try {
        setLoading(true);
        const settings = await getUserSettings(userId);
        
        if (settings) {
          // Update settings state
          setEmailNotifications(settings.emailNotifications ?? true);
          setChatNotifications(settings.chatNotifications ?? true);
          setAutoReply(settings.autoReply ?? false);
          setTwoFactor(settings.twoFactor ?? false);
          
          // Update response template form
          if (settings.responseTemplate) {
            responseTemplateForm.setValue("responseTemplate", settings.responseTemplate);
          }
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
    
    // Only load settings when userId is available
    if (userId) {
      loadSettings();
    }
  }, [userId, toast, profileForm, responseTemplateForm, user]);

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

  async function onTemplateSubmit(values: z.infer<typeof responseTemplateSchema>) {
    if (!userId) return;
    
    try {
      const result = await updateModAutoReply(userId, autoReply, values.responseTemplate);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Auto-reply settings updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update auto-reply settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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

  async function handleAutoReplyChange(checked: boolean) {
    if (!userId) return;
    
    setAutoReply(checked);
    try {
      const template = responseTemplateForm.getValues("responseTemplate");
      await updateModAutoReply(userId, checked, template);
    } catch (error) {
      console.error("Error updating auto-reply:", error);
      setAutoReply(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update auto-reply settings",
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

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderator Settings</h1>
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

        {/* Chat Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat Settings
            </CardTitle>
            <CardDescription>Configure how you interact with messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Chat Notifications</span>
                </div>
                <p className="text-sm text-gray-500">Receive notifications for new messages</p>
              </div>
              <Switch
                checked={chatNotifications}
                onCheckedChange={handleChatNotificationsChange}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Auto-Reply</span>
                </div>
                <p className="text-sm text-gray-500">Automatically reply to new messages</p>
              </div>
              <Switch
                checked={autoReply}
                onCheckedChange={handleAutoReplyChange}
              />
            </div>
            
            {/* Response Template */}
            <Form {...responseTemplateForm}>
              <form onSubmit={responseTemplateForm.handleSubmit(onTemplateSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={responseTemplateForm.control}
                  name="responseTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auto-Reply Template</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your automatic response template here..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be sent automatically to new conversations if auto-reply is enabled.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save Template</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Other Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email Notifications</span>
                </div>
                <p className="text-sm text-gray-500">Receive email notifications</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsChange}
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
                onCheckedChange={handleTwoFactorChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
