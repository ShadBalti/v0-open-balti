"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
} from "lucide-react"
import UserManagement from "./user-management"
import ContentModeration from "./content-moderation"
import AnalyticsDashboard from "./analytics-dashboard"
import SystemSettings from "./system-settings"

interface DashboardStats {
  totalUsers: number
  totalWords: number
  pendingReviews: number
  flaggedContent: number
  newUsersToday: number
  wordsAddedToday: number
  systemHealth: "good" | "warning" | "critical"
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/dashboard-stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard statistics")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStats = async () => {
    try {
      setIsUpdatingStats(true)
      const response = await fetch("/api/admin/update-stats", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "User statistics updated successfully",
        })
        fetchDashboardStats()
      } else {
        throw new Error(result.error || "Failed to update statistics")
      }
    } catch (error) {
      console.error("Error updating stats:", error)
      toast({
        title: "Error",
        description: "Failed to update statistics",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStats(false)
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "good":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Healthy
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.newUsersToday || 0} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWords || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.wordsAddedToday || 0} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">{stats && getHealthBadge(stats.systemHealth)}</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleUpdateStats} disabled={isUpdatingStats} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingStats ? "animate-spin" : ""}`} />
              Update Statistics
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Security Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
