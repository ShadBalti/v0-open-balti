"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RefreshCw, Database, Shield, Bell } from "lucide-react"

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  autoApproveWords: boolean
  maxWordsPerUser: number
  backupFrequency: string
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "OpenBalti Dictionary",
    siteDescription: "A comprehensive Balti-English dictionary platform",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    autoApproveWords: false,
    maxWordsPerUser: 100,
    backupFrequency: "daily",
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      const response = await fetch("/api/admin/backup", { method: "POST" })
      if (response.ok) {
        alert("Backup initiated successfully")
      }
    } catch (error) {
      console.error("Error initiating backup:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Configure user registration and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, registrationEnabled: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWords">Max Words Per User</Label>
                <Input
                  id="maxWords"
                  type="number"
                  value={settings.maxWordsPerUser}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, maxWordsPerUser: Number.parseInt(e.target.value) }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>Configure content approval settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Words</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new word submissions</p>
                </div>
                <Switch
                  checked={settings.autoApproveWords}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoApproveWords: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>Backup and maintenance operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Database Backup</Label>
                  <p className="text-sm text-muted-foreground">Create a backup of the database</p>
                </div>
                <Button onClick={handleBackup} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
