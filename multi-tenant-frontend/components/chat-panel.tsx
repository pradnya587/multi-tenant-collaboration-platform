"use client"

import { useState, useRef, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import type { ChatRoom, TeamMember } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Hash, Lock, MessageCircle } from "lucide-react"
import { format } from "date-fns"

interface ChatPanelProps {
  teamId: string
  type: "group" | "private"
  initialActiveChatId?: string | null
}

export function ChatPanel({ teamId, type, initialActiveChatId }: ChatPanelProps) {
  const { getTeamChats, sendMessage, currentUser, getUserById, teams, getUserRole, startPrivateChat } = useApp()

  const chats = getTeamChats(teamId)?.filter((c) => c.type === type) || []
  const team = teams.find((t) => t.id === teamId)
  const role = getUserRole(teamId, currentUser?.id ?? "")
  const isAdmin = role === "admin"

  const [activeChatId, setActiveChatId] = useState<string | null>(initialActiveChatId ?? null)
  const [message, setMessage] = useState("")
  const [fetchedMembers, setFetchedMembers] = useState<TeamMember[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)

  // ═══════════════════════════════════════════════
  // FETCH POPULATED MEMBERS FOR PRIVATE SIDEBAR
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (type !== "private" || !teamId) return
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token") || ""
        const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) setFetchedMembers(data)
      } catch (err) {
        console.error("Failed to fetch members:", err)
      }
    }
    fetchMembers()
  }, [type, teamId])

  // Members to show in private chat sidebar (populated with names)
  const sidebarMembers = type === "private"
    ? fetchedMembers.filter((m) => {
        const memberId = m.userId?._id || (m.userId as any)
        if (memberId === currentUser?.id) return false
        // Admin sees all members; Regular member sees only admin
        if (!isAdmin && m.role !== "admin") return false
        return true
      })
    : []

  // Get the existing private chat for a specific member
  const getMemberChat = (memberId: string) => {
    if (!currentUser) return undefined
    const ids = [currentUser.id, memberId].sort()
    const chatId = `private_${teamId}_${ids[0]}_${ids[1]}`
    return chats.find((c) => c.id === chatId)
  }

  // Auto select first chat
  useEffect(() => {
    if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id)
    }
  }, [chats, activeChatId])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  const handleSend = () => {
    if (!message.trim() || !activeChatId) return
    sendMessage(activeChatId, message)
    setMessage("")
  }

  const handleStartPrivateChat = (memberId: string) => {
    const chatId = startPrivateChat(teamId, memberId)
    setActiveChatId(chatId)
  }

  const getChatName = (chat: ChatRoom) => {
    if (chat.type === "group") return chat.name ?? "General"

    const otherUserId = chat.participants.find(
      (p) => p !== currentUser?.id
    )

    // Try fetched (populated) members first for display name
    const fetchedMember = fetchedMembers.find(
      (m) => (m.userId?._id || (m.userId as any)) === otherUserId
    )
    if (fetchedMember?.userId?.name) return fetchedMember.userId.name

    return otherUserId
      ? getUserById(otherUserId)?.name ?? "Unknown"
      : "Unknown"
  }

  const getChatInitial = (chat: ChatRoom) => {
    const name = getChatName(chat)
    return name.charAt(0).toUpperCase()
  }

  // ═══════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════

  // Private chat — no available members (solo team)
  if (type === "private" && sidebarMembers.length === 0 && fetchedMembers.length > 0) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-2xl border bg-card">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Lock className="h-10 w-10 opacity-30" />
          <p className="text-sm">No members available for private chat</p>
        </div>
      </div>
    )
  }

  // Private chat — still loading members
  if (type === "private" && fetchedMembers.length === 0) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-2xl border bg-card">
        <p className="text-sm text-muted-foreground animate-pulse">Loading members...</p>
      </div>
    )
  }

  // Group empty state
  if (type === "group" && chats.length === 0) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center text-muted-foreground">
        No chats available for this team
      </div>
    )
  }

  // ═══════════════════════════════════════════════
  // MAIN CHAT UI
  // ═══════════════════════════════════════════════
  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card to-card/50 shadow-lg">

      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-border/30 bg-gradient-to-b from-background/50 to-background/20">
        <div className="flex items-center justify-between p-4">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            {type === "group" ? "Channels" : "Direct Messages"}
          </span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {type === "private" ? (
              // ── Member-list sidebar for Private Chat ──
              sidebarMembers.map((member) => {
                const memberId = member.userId?._id || (member.userId as any)
                const memberChat = getMemberChat(memberId)
                const isActive = memberChat && activeChatId === memberChat.id
                const lastMsg = memberChat?.messages[memberChat.messages.length - 1]
                const memberName = member.userId?.name ?? "Unknown"

                return (
                  <button
                    key={memberId}
                    onClick={() => handleStartPrivateChat(memberId)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {memberName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{memberName}</p>
                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                          {member.role}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lastMsg.senderName?.split(" ")[0]}: {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              // ── Chat-list sidebar for Group Chat ──
              chats.map((chat) => {
                const isActive = activeChatId === chat.id
                const lastMsg = chat.messages[chat.messages.length - 1]

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getChatName(chat)}</p>
                      {lastMsg && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lastMsg.senderName?.split(" ")[0]}: {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/30 px-4 py-4 bg-gradient-to-r from-background/30 to-transparent">
          {activeChat && type === "private" && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {getChatInitial(activeChat)}
              </AvatarFallback>
            </Avatar>
          )}
          {activeChat && type === "group" && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Hash className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">
              {activeChat ? getChatName(activeChat) : "Select a conversation"}
            </p>
            {activeChat && type === "private" && (
              <p className="text-xs text-muted-foreground">Private conversation</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-transparent via-background/10 to-background/20">
          {!activeChat && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a member to start chatting</p>
            </div>
          )}
          {activeChat?.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          )}
          {activeChat?.messages.map((msg) => {
            const isOwn = msg.senderId === currentUser?.id

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {!isOwn && (
                  <span className="px-1 text-xs font-medium text-muted-foreground">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                    isOwn
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-primary/20"
                      : "bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
                <span className="px-1 text-[10px] text-muted-foreground/60">
                  {format(new Date(msg.timestamp), "h:mm a")}
                </span>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2 border-t border-border/30 px-4 py-4 bg-gradient-to-t from-background/50 to-transparent"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={type === "private" ? "Type a private message..." : "Type a message..."}
            className="flex-1 rounded-xl h-10 bg-gradient-to-r from-background/60 to-background/40 border-border/60 transition-all focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10"
            disabled={!activeChatId}
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all" disabled={!activeChatId}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
