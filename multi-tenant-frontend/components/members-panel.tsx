"use client"

import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, User, UserMinus, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface MembersPanelProps {
  teamId: string
}

export function MembersPanel({ teamId }: MembersPanelProps) {
  const { teams, getUserById, currentUser, removeMember, updateMemberRole, getUserRole } = useApp()
  const team = teams.find((t) => t.id === teamId)
  const isAdmin = getUserRole(teamId, currentUser?.id ?? "") === "admin"
  const [copied, setCopied] = useState(false)

  if (!team) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.code)
    setCopied(true)
    toast.success("Invite code copied!")
    setTimeout(() => setCopied(false), 2000)
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
              <p className="text-xs text-muted-foreground">{team.members.length} people in this team</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/20">
          {team.members.map((member) => {
            const user = getUserById(member.userId)
            if (!user) return null
            const isSelf = user.id === currentUser?.id
            return (
              <div key={member.userId} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/20">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-2 ring-offset-card">
                      <AvatarFallback className="bg-primary/10 font-bold text-primary">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                        user.status === "online"
                          ? "bg-success"
                          : user.status === "away"
                            ? "bg-warning"
                            : "bg-muted-foreground/40",
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {user.name}
                      </span>
                      {isSelf && (
                        <Badge variant="outline" className="h-5 border-primary/20 px-1.5 text-[10px] font-medium text-primary">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-[10px] font-semibold uppercase tracking-wider",
                      member.role === "admin"
                        ? "border-primary/30 text-primary"
                        : "border-border/50 text-muted-foreground",
                    )}
                  >
                    {member.role === "admin" ? (
                      <><Shield className="h-3 w-3" /> Admin</>
                    ) : (
                      <><User className="h-3 w-3" /> Member</>
                    )}
                  </Badge>
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
                            updateMemberRole(teamId, user.id, member.role === "admin" ? "member" : "admin")
                            toast.success(`${user.name} is now ${member.role === "admin" ? "a member" : "an admin"}`)
                          }}
                          className="rounded-lg"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {member.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-lg text-destructive focus:text-destructive"
                          onClick={() => {
                            removeMember(teamId, user.id)
                            toast.success(`${user.name} removed from team`)
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
          })}
        </div>
      </div>
    </div>
  )
}
