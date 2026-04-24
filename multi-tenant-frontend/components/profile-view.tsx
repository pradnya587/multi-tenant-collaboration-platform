"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mail, Users, CheckSquare, TrendingUp } from "lucide-react"

export function ProfileView() {
  const { currentUser, teams } = useApp()
  const [userTasks, setUserTasks] = useState<any[]>([])

  const BASE_URL = "http://localhost:5000"

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/tasks/user/${currentUser?.id}`)
        const data = await res.json()
        setUserTasks(data)
      } catch (err) {
        console.error(err)
      }
    }
    if (currentUser?.id) fetchTasks()
  }, [currentUser])

  if (!currentUser) return null

  const myTeams = teams.filter((t) =>
    t.members.some((m) => {
      const id = m.userId?._id || m.userId
      return id?.toString() === currentUser.id?.toString()
    })
  )

  const completedTasks = userTasks.filter((t) => t.status === "completed")

  const completionRate =
    userTasks.length > 0
      ? Math.round((completedTasks.length / userTasks.length) * 100)
      : 0

  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card">
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-chart-2/10" />
        <div className="relative px-8 pb-8">
          <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 ring-4 ring-card shadow-lg">
              <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                {currentUser.name?.charAt(0).toUpperCase()}
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
              <Badge className="mt-2 w-fit bg-success/15 text-success sm:mt-0">
                <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-success" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{myTeams.length}</p>
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-chart-2" />
            <div>
              <p className="text-2xl font-bold">{userTasks.length}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-success" />
            <div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-warning" />
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
          <Progress value={completionRate} className="mt-3 h-1.5" />
        </div>
      </div>

      {/* Teams */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Team Memberships</h3>
        </div>

        {myTeams.map((team) => {
          // ✅ role and teamTasks now correctly live inside the map
          const role = team.members.find((m) => {
            const id = m.userId?._id || m.userId
            return id?.toString() === currentUser.id?.toString()
          })?.role

          const teamTasks = userTasks.filter((t) => {
            const assigneeId = t.assigneeId?._id || t.assigneeId
            const taskTeamId = t.teamId?._id || t.teamId
            const tid = team._id || team.id
            return (
              taskTeamId?.toString() === tid?.toString() &&
              assigneeId?.toString() === currentUser.id?.toString()
            )
          })

          const teamCompleted = teamTasks.filter((t) => t.status === "completed").length

          return (
            <div key={team.id || team._id} className="flex justify-between px-6 py-4 border-b last:border-0">
              <div>
                <p className="font-semibold">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                  {teamCompleted}/{teamTasks.length} tasks done
                </p>
              </div>
              <Badge>{role === "admin" ? "Admin" : "Member"}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}