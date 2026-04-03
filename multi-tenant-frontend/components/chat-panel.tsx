"use client"

import { useState, useRef, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Hash, Lock, Smile } from "lucide-react"
import { format } from "date-fns"

interface ChatPanelProps {
  teamId: string
  type: "group" | "private"
}

export function ChatPanel({ teamId, type }: ChatPanelProps) {
  const { getTeamChats, sendMessage, currentUser, getUserById, teams } = useApp()
  const chats = getTeamChats(teamId).filter((c) => c.type === type)
  const team = teams.find((t) => t.id === teamId)

  const [activeChatId, setActiveChatId] = useState<string | null>(chats[0]?.id ?? null)
  const [message, setMessage] = useState("")
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  const handleSend = () => {
    if (!message.trim() || !activeChatId) return
    sendMessage(activeChatId, message)
    setMessage("")
    const otherParticipant = activeChat?.participants.find((p) => p !== currentUser?.id)
    if (otherParticipant) {
      const user = getUserById(otherParticipant)
      setTypingUser(user?.name ?? null)
      setTimeout(() => setTypingUser(null), 2000)
    }
  }

  const getChatName = (chat: ChatRoom) => {
    if (chat.type === "group") return chat.name ?? "General"
    const otherUserId = chat.participants.find((p) => p !== currentUser?.id)
    return otherUserId ? getUserById(otherUserId)?.name ?? "Unknown" : "Unknown"
  }

  const memberList = type === "private" ? team?.members.filter((m) => m.userId !== currentUser?.id) : null

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
      {/* Sidebar */}
      <div className="flex w-56 flex-col border-r border-border/30 bg-background/50 lg:w-64">
        <div className="border-b border-border/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            {type === "group" ? "Channels" : "Direct Messages"}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {chats.map((chat) => {
              const isActive = activeChatId === chat.id
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  {type === "group" ? (
                    <Hash className="h-4 w-4 shrink-0" />
                  ) : (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className={cn(
                        "text-[10px] font-bold",
                        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {getChatName(chat).split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="truncate font-medium">{getChatName(chat)}</span>
                </button>
              )
            })}
            {type === "private" && memberList && (
              <>
                <div className="px-3 pb-1 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Start a chat
                  </p>
                </div>
                {memberList
                  .filter((m) => !chats.some((c) => c.participants.includes(m.userId)))
                  .map((member) => {
                    const user = getUserById(member.userId)
                    return (
                      <button
                        key={member.userId}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">
                            {user?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user?.name}</span>
                      </button>
                    )
                  })}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/30 bg-background/30 px-5 py-3.5">
          {type === "group" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Hash className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">
              {activeChat ? getChatName(activeChat) : "Select a chat"}
            </p>
            {activeChat && (
              <p className="text-xs text-muted-foreground">
                {activeChat.participants.length} {activeChat.participants.length === 1 ? "member" : "members"}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {activeChat ? (
            <div className="flex flex-col gap-5">
              {activeChat.messages.map((msg, i) => {
                const isOwn = msg.senderId === currentUser?.id
                const showAvatar = i === 0 || activeChat.messages[i - 1]?.senderId !== msg.senderId
                return (
                  <div
                    key={msg.id}
                    className={cn("flex items-end gap-2.5", isOwn ? "flex-row-reverse" : "")}
                  >
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-bold",
                            isOwn ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                          )}
                        >
                          {msg.senderAvatar}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}
                    <div className={cn("flex max-w-[65%] flex-col gap-1", isOwn ? "items-end" : "")}>
                      {showAvatar && (
                        <div className={cn("flex items-center gap-2 px-1", isOwn ? "flex-row-reverse" : "")}>
                          <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {format(new Date(msg.timestamp), "h:mm a")}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          isOwn
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-accent/70 text-foreground",
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              {typingUser && (
                <div className="flex items-center gap-2 px-10 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "0ms" }} />
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "150ms" }} />
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>{typingUser} is typing</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageCircleIcon className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/30 bg-background/30 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background px-3 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
              <Smile className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-30 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}
