"use client"

import { useState, useEffect } from "react" // ✅ added useEffect
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatPanel } from "@/components/chat-panel"
import { TaskBoard } from "@/components/task-board"
import { MembersPanel } from "@/components/members-panel"
import { ArrowLeft, Hash, Lock, CheckSquare, Users } from "lucide-react"

interface TeamWorkspaceProps {
  teamId: string
  onBack: () => void
}

export function TeamWorkspace({ teamId, onBack, initialTab = "members" }: any){
  const { teams, currentUser, getUserRole, startPrivateChat } = useApp()
  const team = teams.find((t) => t.id === teamId)
  const role = getUserRole(teamId, currentUser?.id ?? "")
  const showPrivateTab = (team?.members?.length ?? 0) > 1

  // Controlled tab state
  const [activeTab, setActiveTab] = useState(initialTab || "members")
  const [privateChatTarget, setPrivateChatTarget] = useState<string | null>(null)

  // ✅ FIX: Reset tab when team changes
  useEffect(() => {
    setActiveTab("members")
  }, [teamId])

  // Called when user clicks "Message" on a member in the Members panel
  const handleMessageMember = (memberId: string) => {
    const chatId = startPrivateChat(teamId, memberId)
    setPrivateChatTarget(chatId)
    setActiveTab("private-chat")
  }

  if (!team) return null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/40 bg-card/50 px-6 py-4 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-md">
            {team.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">{team.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  role === "admin" ? "border-primary/30 text-primary" : "border-border/50 text-muted-foreground"
                )}
              >
                {role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-5">
          <TabsList className="w-fit rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="group-chat" className="gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Hash className="h-3.5 w-3.5" /> Group Chat
            </TabsTrigger>
            
            {/* Private Chat: show when team has other members */}
            {showPrivateTab && (
              <TabsTrigger value="private-chat" className="gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Lock className="h-3.5 w-3.5" /> Private Chat
              </TabsTrigger>
            )}

            <TabsTrigger value="tasks" className="gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CheckSquare className="h-3.5 w-3.5" /> Task Board
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" /> Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="group-chat">
            <ChatPanel teamId={teamId} type="group" />
          </TabsContent>

          {showPrivateTab && (
            <TabsContent value="private-chat">
              <ChatPanel teamId={teamId} type="private" initialActiveChatId={privateChatTarget} />
            </TabsContent>
          )}

          <TabsContent value="tasks">
            <TaskBoard teamId={teamId} />
          </TabsContent>

          <TabsContent value="members">
            <MembersPanel teamId={teamId} onStartPrivateChat={handleMessageMember} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}