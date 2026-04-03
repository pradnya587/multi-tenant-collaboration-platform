"use client"

import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mail, Users, CheckSquare, Shield, User, TrendingUp } from "lucide-react"

export function ProfileView() {
  const { currentUser, teams, tasks } = useApp()

  if (!currentUser) return null

  const myTeams = teams.filter((t) => t.members.some((m) => m.userId === currentUser.id))
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id)
  const completedTasks = myTasks.filter((t) => t.status === "completed")
  const inProgressTasks = myTasks.filter((t) => t.status === "in-progress")
  const completionRate = myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0

  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card">
        {/* Gradient banner */}
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-chart-2/10" />
        <div className="relative px-8 pb-8">
          <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 ring-4 ring-card ring-offset-0 shadow-lg">
              <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-sm">{currentUser.email}</span>
                </div>
              </div>
              <Badge className="mt-2 w-fit bg-success/15 text-success hover:bg-success/15 sm:mt-0">
                <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-success" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{myTeams.length}</p>
              <p className="text-xs font-medium text-muted-foreground">Teams</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/15">
              <CheckSquare className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{myTasks.length}</p>
              <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
              <CheckSquare className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-xs font-medium text-muted-foreground">Completion</p>
            </div>
          </div>
          <Progress value={completionRate} className="mt-3 h-1.5" />
        </div>
      </div>

      {/* Teams list */}
      <div className="rounded-2xl border border-border/40 bg-card">
        <div className="border-b border-border/40 px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Team Memberships</h3>
          <p className="text-sm text-muted-foreground">Teams you are part of</p>
        </div>
        <div className="divide-y divide-border/30">
          {myTeams.map((team) => {
            const role = team.members.find((m) => m.userId === currentUser.id)?.role
            const teamTasks = tasks.filter((t) => t.teamId === team.id && t.assigneeId === currentUser.id)
            const teamCompleted = teamTasks.filter((t) => t.status === "completed").length
            return (
              <div key={team.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.members.length} members -- {teamCompleted}/{teamTasks.length} tasks done</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-xs font-medium",
                    role === "admin"
                      ? "border-primary/30 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {role}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
