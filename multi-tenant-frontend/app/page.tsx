"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { AuthScreen } from "@/components/auth-screen"
import { AppSidebar, type NavPage } from "@/components/app-sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { TeamWorkspace } from "@/components/team-workspace"
import { ProfileView } from "@/components/profile-view"
import { CreateTeamModal } from "@/components/create-team-modal"
import { JoinTeamModal } from "@/components/join-team-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, UserPlus, Users, MessageCircle, CheckSquare, ArrowUpRight } from "lucide-react"


export default function Home() {
  const { isAuthenticated, currentUser, teams, tasks, getUserById } = useApp()
  const [activePage, setActivePage] = useState<NavPage>("dashboard")
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

 const [refresh, setRefresh] = useState(false)

if (!isAuthenticated || !currentUser) {
  return <AuthScreen onSuccess={() => window.location.reload()} />
}


  if (activeTeamId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar
          activePage="teams"
          onNavigate={(page) => {
            setActiveTeamId(null)
            setActivePage(page)
          }}
        />
        <main className="flex-1 overflow-hidden">
          <TeamWorkspace
            teamId={activeTeamId}
            onBack={() => setActiveTeamId(null)}
          />
        </main>
      </div>
    )
  }

  const myTeams = teams.filter((t) => t.members.some((m) => m.userId === currentUser.id))

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-auto">
        {activePage === "dashboard" && (
          <DashboardView
            onCreateTeam={() => setCreateOpen(true)}
            onJoinTeam={() => setJoinOpen(true)}
            onNavigateToTeam={(id) => setActiveTeamId(id)}
          />
        )}

        {activePage === "teams" && (
          <div className="flex flex-col gap-8 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">My Teams</h1>
                <p className="mt-1 text-sm text-muted-foreground">{myTeams.length} teams you belong to</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setCreateOpen(true)} className="glow-primary rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
                <Button variant="outline" onClick={() => setJoinOpen(true)} className="rounded-xl border-border/60 hover:border-primary/30 hover:bg-accent/60">
                  <UserPlus className="mr-2 h-4 w-4" /> Join
                </Button>
              </div>
            </div>
            {myTeams.length === 0 ? (
              <div className="rounded-2xl border border-border/40 bg-card">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">No teams yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create a team or join one with an invite code.</p>
                  <div className="mt-6 flex gap-2">
                    <Button onClick={() => setCreateOpen(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Create Team</Button>
                    <Button variant="outline" onClick={() => setJoinOpen(true)} className="rounded-xl border-border/60">Join Team</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myTeams.map((team) => {
                  const role = team.members.find((m) => m.userId === currentUser.id)?.role
                  const teamTasks = tasks.filter((t) => t.teamId === team.id)
                  const teamCompleted = teamTasks.filter((t) => t.status === "completed").length
                  const progress = teamTasks.length > 0 ? (teamCompleted / teamTasks.length) * 100 : 0
                  return (
                    <button
                      key={team.id}
                      onClick={() => setActiveTeamId(team.id)}
                      className="group flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary transition-colors group-hover:bg-primary/15">
                          {team.name.charAt(0)}
                        </div>
                        <Badge
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            role === "admin"
                              ? "bg-primary/15 text-primary hover:bg-primary/15"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary"
                          )}
                        >
                          {role}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{team.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{team.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{teamCompleted}/{teamTasks.length} tasks</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          {team.members.slice(0, 3).map((m) => {
                            const u = getUserById(m.userId)
                            return (
                              <Avatar key={m.userId} className="h-6 w-6 border-2 border-card">
                                <AvatarFallback className="bg-primary/10 text-[8px] font-bold text-primary">{u?.avatar}</AvatarFallback>
                              </Avatar>
                            )
                          })}
                          {team.members.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[8px] font-bold text-muted-foreground">
                              +{team.members.length - 3}
                            </div>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:text-primary" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activePage === "tasks" && (
          <div className="flex flex-col gap-8 p-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">All My Tasks</h1>
              <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you across all teams</p>
            </div>
            {(() => {
              const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id)
              if (myTasks.length === 0) {
                return (
                  <div className="rounded-2xl border border-border/40 bg-card">
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <CheckSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-foreground">No tasks assigned</p>
                      <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you will appear here.</p>
                    </div>
                  </div>
                )
              }
              return (
                <div className="rounded-2xl border border-border/40 bg-card">
                  <div className="divide-y divide-border/30">
                    {myTasks.map((task) => {
                      const team = teams.find((t) => t.id === task.teamId)
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/20"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full",
                                task.status === "completed"
                                  ? "bg-success"
                                  : task.status === "in-progress"
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "font-medium",
                                  task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground",
                                )}>{task.title}</p>
                                <Badge variant="outline" className="shrink-0 text-[10px] border-border/50 text-muted-foreground">
                                  {team?.name}
                                </Badge>
                              </div>
                              <p className="mt-0.5 truncate text-sm text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-4 shrink-0 text-xs font-medium",
                              task.status === "completed"
                                ? "border-success/30 text-success"
                                : task.status === "in-progress"
                                  ? "border-primary/30 text-primary"
                                  : "border-border text-muted-foreground",
                            )}
                          >
                            {task.status === "in-progress" ? "In Progress" : task.status === "todo" ? "To Do" : "Done"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {activePage === "chat" && (
          <div className="flex flex-col gap-8 p-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat</h1>
              <p className="mt-1 text-sm text-muted-foreground">Select a team to start chatting</p>
            </div>
            {myTeams.length === 0 ? (
              <div className="rounded-2xl border border-border/40 bg-card">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">No chats available</p>
                  <p className="mt-1 text-sm text-muted-foreground">Join a team to start chatting.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setActiveTeamId(team.id)}
                    className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary/15">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.members.length} members</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === "profile" && <ProfileView />}
      </main>

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinTeamModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  )
}