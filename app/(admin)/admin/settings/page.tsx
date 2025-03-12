"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Mail,
  Shield,
  Lock,
  User,
  Globe,
  Database,
  Save,
  AlertTriangle,
} from "lucide-react";

// Initial settings data
const initialSettings = {
  general: {
    siteName: "Bravos International",
    siteDescription: "Leading overseas education consultancy in Nepal",
    logo: "/logo/logo.jpg",
    favicon: "/favicon.ico",
    language: "en",
    timezone: "Asia/Kathmandu",
  },
  security: {
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAttempts: 5,
  },
  notifications: {
    emailNotifications: true,
    adminAlerts: true,
    userRegistration: true,
    contactFormSubmissions: true,
  },
  email: {
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "noreply@example.com",
    senderName: "Bravos International",
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
  },
};

export default function SettingsManagement() {
  const [settings, setSettings] = useState(initialSettings);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log("Saving settings:", settings);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" /> Save Changes
            </>
          ) : (
            "Edit Settings"
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={settings.general.siteName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Site Description</Label>
              <Input
                value={settings.general.siteDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      siteDescription: e.target.value,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                disabled={!isEditing}
                value={settings.general.language}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, language: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ne">Nepali</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                disabled={!isEditing}
                value={settings.general.timezone}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kathmandu">Asia/Kathmandu</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: checked },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Password Expiry (days)</Label>
              <Input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      passwordExpiry: parseInt(e.target.value),
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      sessionTimeout: parseInt(e.target.value),
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.security.loginAttempts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      loginAttempts: parseInt(e.target.value),
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send system notifications via email
                </p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailNotifications: checked,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Admin Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins of important events
                </p>
              </div>
              <Switch
                checked={settings.notifications.adminAlerts}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      adminAlerts: checked,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Notify on new user registrations
                </p>
              </div>
              <Switch
                checked={settings.notifications.userRegistration}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      userRegistration: checked,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Contact Form</Label>
                <p className="text-sm text-muted-foreground">
                  Notify on contact form submissions
                </p>
              </div>
              <Switch
                checked={settings.notifications.contactFormSubmissions}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      contactFormSubmissions: checked,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input
                value={settings.email.smtpHost}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpHost: e.target.value },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input
                value={settings.email.smtpPort}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPort: e.target.value },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP User</Label>
              <Input
                value={settings.email.smtpUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpUser: e.target.value },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input
                value={settings.email.senderName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, senderName: e.target.value },
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic system backups
                </p>
              </div>
              <Switch
                checked={settings.backup.autoBackup}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    backup: { ...settings.backup, autoBackup: checked },
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select
                disabled={!isEditing}
                value={settings.backup.backupFrequency}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    backup: { ...settings.backup, backupFrequency: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Retention Period (days)</Label>
              <Input
                type="number"
                value={settings.backup.retentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    backup: {
                      ...settings.backup,
                      retentionDays: parseInt(e.target.value),
                    },
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}