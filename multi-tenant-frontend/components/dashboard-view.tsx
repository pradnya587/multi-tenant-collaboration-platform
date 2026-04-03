"use client"

import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp } from "lucide-react"

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts"

interface DashboardViewProps {
  onCreateTeam: () => void
  onJoinTeam: () => void
  onNavigateToTeam: (teamId: string) => void
}

// 🔥 Custom Tooltip (THIS is what you wanted)
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-muted-foreground">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardView({
  onCreateTeam,
  onJoinTeam,
}: DashboardViewProps) {

  const { tasks, currentUser } = useApp()

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id)

  const pendingTasks = myTasks.filter((t) => t.status === "todo")
  const inProgressTasks = myTasks.filter((t) => t.status === "in-progress")
  const completedTasks = myTasks.filter((t) => t.status === "completed")

  const completionRate =
    myTasks.length > 0
      ? Math.round((completedTasks.length / myTasks.length) * 100)
      : 0

  // 🔥 Dummy weekly data (can connect real later)
  const weeklyData = [
    { day: "Mon", tasks: 12, messages: 45 },
    { day: "Tue", tasks: 18, messages: 62 },
    { day: "Wed", tasks: 15, messages: 38 },
    { day: "Thu", tasks: 22, messages: 72 },
    { day: "Fri", tasks: 19, messages: 55 },
    { day: "Sat", tasks: 8, messages: 20 },
    { day: "Sun", tasks: 5, messages: 12 },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
          </p>
          <h1 className="text-3xl font-bold">
            Welcome back, {currentUser?.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button onClick={onCreateTeam} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
          <Button variant="outline" onClick={onJoinTeam} className="rounded-xl">
            Join
          </Button>
        </div>
      </div>

      {/* HERO */}
      <div className="rounded-2xl border bg-card p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Overall Productivity</p>
            <h2 className="text-4xl font-bold">{completionRate}%</h2>
          </div>
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>

        <Progress value={completionRate} className="h-2" />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold">{pendingTasks.length}</p>
            <p className="text-xs text-muted-foreground">Todo</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{inProgressTasks.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-500">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>
      </div>

      {/* 🔥 Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Tasks Line Chart */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Tasks Completed</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Messages Bar Chart */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Messages</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="messages" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}