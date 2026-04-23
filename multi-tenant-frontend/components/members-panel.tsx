"use client"

import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, User, UserMinus, Copy, Check, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { TeamMember } from "@/lib/types"

interface MembersPanelProps {
  teamId: string
  onStartPrivateChat?: (memberId: string) => void
}

export function MembersPanel({ teamId, onStartPrivateChat }: MembersPanelProps) {
  const { teams, currentUser, removeMember, updateMemberRole, getUserRole } = useApp()
  const team = teams.find((t) => t.id === teamId)
  const isAdmin = getUserRole(teamId, currentUser?.id ?? "") === "admin"
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
  const fetchMembers = async () => {
    if (!teamId) return
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(
        `http://localhost:5000/api/teams/${teamId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (Array.isArray(data)) setMembers(data)
    } catch (err) {
      console.error("Failed to fetch members:", err)
    }
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(
        `http://localhost:5000/api/tasks/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (Array.isArray(data)) setTasks(data)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  // ✅ initial fetch
  fetchMembers()
  fetchTasks()

  // ✅ auto refresh every 3 sec
  const interval = setInterval(fetchTasks, 3000)

  // ✅ cleanup
  return () => clearInterval(interval)

}, [teamId])


  if (!team) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.code)
    setCopied(true)
    toast.success("Invite code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Determine if the current user can message a specific member
  const canMessage = (memberId: string, memberRole: string) => {
    if (memberId === currentUser?.id) return false // can't message self
    if (isAdmin) return true // admin can message anyone
    if (memberRole === "admin") return true // member can message admin
    return false
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Invite code card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Invite Code
            </p>
            <p className="mt-1 font-mono text-xl font-bold tracking-widest text-primary">{team.code}</p>
            <p className="mt-1 text-xs text-muted-foreground">Share this code with others to join your team</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className={cn(
              "rounded-xl border-border/50 transition-all",
              copied && "border-success/30 text-success"
            )}
          >
            {copied ? (
              <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</>
            ) : (
              <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</>
            )}
          </Button>
        </div>
      </div>

      {/* Members list */}
      <div className="rounded-2xl border border-border/40 bg-card">
        <div className="border-b border-border/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Members</p>
              <p className="text-xs text-muted-foreground">
                {members.length > 0 ? members.length : team.members.length} people in this team
              </p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/20">
          {members.length === 0 ? (
            /* Loading state while members are being fetched */
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground animate-pulse">Loading members...</p>
            </div>
          ) : (
            /* Render using fetched (populated) member data */
            members.map((member) => {
              const memberId = member.userId?._id || (member.userId as any)
              const memberName = member.userId?.name ?? "Unknown"
              const memberEmail = member.userId?.email ?? ""
              const isSelf = memberId === currentUser?.id
              const memberRole = member.role

 const memberTasks = tasks.filter(
  (task) =>
    task.assigneeId === memberId ||
    task.assigneeId === member.userId?._id
)

const completedTasks = memberTasks.filter(
  (task) => task.status === "completed"
).length

const totalTasks = memberTasks.length

const progress =
  totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100)


              return (
                <div key={memberId} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/20">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-2 ring-offset-card">
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {memberName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {memberName}
                        </span>
                        {isSelf && (
                          <Badge variant="outline" className="h-5 border-primary/20 px-1.5 text-[10px] font-medium text-primary">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{memberEmail}</p>

{/* 🔥 Task Info */}
<div className="mt-1 text-xs text-muted-foreground">
  {totalTasks} tasks • {progress}% completed
</div>

{/* 🔥 Progress Bar */}
<div className="mt-2 h-1.5 w-32 rounded-full bg-muted">
  <div
    className="h-full rounded-full bg-primary"
    style={{ width: `${progress}%` }}
  />
</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[10px] font-semibold uppercase tracking-wider",
                        memberRole === "admin"
                          ? "border-primary/30 text-primary"
                          : "border-border/50 text-muted-foreground",
                      )}
                    >
                      {memberRole === "admin" ? (
                        <><Shield className="h-3 w-3" /> Admin</>
                      ) : (
                        <><User className="h-3 w-3" /> Member</>
                      )}
                    </Badge>

                    {/* Message button — opens private chat with this member */}
                    {canMessage(memberId, memberRole) && onStartPrivateChat && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStartPrivateChat(memberId)}
                        className="h-8 gap-1.5 rounded-lg border-border/50 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Button>
                    )}

                    {isAdmin && !isSelf && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                          <DropdownMenuItem
                            onClick={() => {
                              updateMemberRole(teamId, memberId, memberRole === "admin" ? "member" : "admin")
                              toast.success(`${memberName} is now ${memberRole === "admin" ? "a member" : "an admin"}`)
                            }}
                            className="rounded-lg"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {memberRole === "admin" ? "Demote to Member" : "Promote to Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-lg text-destructive focus:text-destructive"
                            onClick={() => {
                              removeMember(teamId, memberId)
                              toast.success(`${memberName} removed from team`)
                            }}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
