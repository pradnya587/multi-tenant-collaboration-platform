"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { User, Team, Task, ChatRoom, Message, TaskStatus, Role } from "@/lib/types"
import { useEffect, useRef } from "react"
import { createTeamAPI, joinTeamAPI } from "@/lib/team"
import { getMyTeamsAPI } from "@/lib/team"
import API from "@/lib/api"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"



interface AppContextType {
  currentUser: User | null
  isAuthenticated: boolean
  teams: Team[]
  tasks: Task[]
  chats: ChatRoom[]
  users: User[]
  activeTeamId: string | null
 login: (user: User) => void
register: (user: User) => void
  logout: () => void
  setActiveTeamId: (id: string | null) => void
  createTeam: (name: string, description: string) => Promise<Team>
  joinTeam: (code: string) => Promise<Team | null>
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  deleteTask: (taskId: string) => void
  sendMessage: (chatId: string, content: string) => void
  removeMember: (teamId: string, userId: string) => void
  updateMemberRole: (teamId: string, userId: string, role: Role) => void
  getUserById: (id: string) => User | undefined
  getTeamChats: (teamId: string) => ChatRoom[]
  getTeamTasks: (teamId: string) => Task[]
  getUserRole: (teamId: string, userId: string) => Role | undefined
  startPrivateChat: (teamId: string, memberId: string) => string
}


//ORIGINAL
const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
 const [currentUser, setCurrentUser] = useState<User | null>(null)
 const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
const [tasks, setTasks] = useState<Task[]>([])
const [chats, setChats] = useState<ChatRoom[]>([])
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  // ═══════════════════════════════════════════════
  // 1. RESTORE USER FROM LOCAL STORAGE
  // ═══════════════════════════════════════════════
  useEffect(() => {
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")

  if (token && user && user !== "undefined") {
    try {
      const parsedUser = JSON.parse(user)
      setCurrentUser(parsedUser)
      setIsAuthenticated(true)
      setUsers([parsedUser])
    } catch {
      localStorage.removeItem("user")
    }
  }
}, [])

  // ═══════════════════════════════════════════════
  // 2. LOAD TEAMS + INITIALIZE CHATS + LOAD HISTORY
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await getMyTeamsAPI()
        setTeams(data)

        if (currentUser && Array.isArray(data)) {
          const allNewChats: ChatRoom[] = []

          for (const team of data) {
            // --- Load chat history from MongoDB ---
            try {
              const historyRes = await API.get(`/chats/${team.id}`)
              const dbChats = historyRes.data
              if (Array.isArray(dbChats) && dbChats.length > 0) {
                for (const dbChat of dbChats) {
                  allNewChats.push({
                    id: dbChat.chatId,
                    teamId: team.id,
                    type: dbChat.type === "private" ? "private" : "group",
                    participants: dbChat.participants || [],
                    name: dbChat.type === "group" ? "General" : "Private Chat",
                    messages: dbChat.messages || [],
                  })
                }
              }
            } catch {
              // No history from DB yet, that's fine
            }

            // --- Ensure General group chat exists ---
            const hasGroupChat = allNewChats.some(
              (c) => c.teamId === team.id && c.type === "group"
            )
            if (!hasGroupChat) {
              allNewChats.push({
                id: `c_${team.id}_general`,
                teamId: team.id,
                type: "group",
                participants: [currentUser.id],
                name: "General",
                messages: [],
              })
            }

            // --- Generate Private chats ---
            const isLeader = team.members.some(
              (m: any) => m.userId === currentUser.id && m.role === "admin"
            )

            if (isLeader) {
              // Admin: generate a private chat for every other member
              team.members.forEach((member: any) => {
                if (member.userId !== currentUser.id) {
                  const ids = [currentUser.id, member.userId].sort()
                  const privateChatId = `private_${team.id}_${ids[0]}_${ids[1]}`
                  const hasPrivateChat = allNewChats.some((c) => c.id === privateChatId)
                  if (!hasPrivateChat) {
                    allNewChats.push({
                      id: privateChatId,
                      teamId: team.id,
                      type: "private",
                      participants: [currentUser.id, member.userId],
                      name: "Private Chat",
                      messages: [],
                    })
                  }
                }
              })
            } else {
              // Member: generate a single private chat with the team admin
              const admin = team.members.find((m: any) => m.role === "admin")
              if (admin) {
                const ids = [currentUser.id, admin.userId].sort()
                const privateChatId = `private_${team.id}_${ids[0]}_${ids[1]}`
                const hasPrivateChat = allNewChats.some((c) => c.id === privateChatId)
                if (!hasPrivateChat) {
                  allNewChats.push({
                    id: privateChatId,
                    teamId: team.id,
                    type: "private",
                    participants: [currentUser.id, admin.userId],
                    name: "Private Chat",
                    messages: [],
                  })
                }
              }
            }
          }

          setChats(allNewChats)
        }
      } catch (err) {
        console.error("Failed to load teams:", err)
      }
    }

    if (currentUser) {
      loadTeams()
    }
  }, [currentUser])

  // ═══════════════════════════════════════════════
  // 3. SOCKET.IO — CONNECT, JOIN ROOMS, LISTEN
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (!currentUser || teams.length === 0) return

    const socket = connectSocket()

    // Helper: join all team rooms + re-join private chat rooms
    const joinAllRooms = () => {
      console.log("🔌 Socket connected — joining all rooms...")
      teams.forEach((team) => {
        if (team.id && !joinedRoomsRef.current.has(team.id)) {
          socket.emit("join_team", team.id)
          joinedRoomsRef.current.add(team.id)
          console.log(`👥 Socket joined team room: ${team.id}`)
        }
      })
      // Also re-join any private chat rooms
      chats.forEach((chat) => {
        if (
          chat.type === "private" &&
          chat.participants.includes(currentUser.id) &&
          !joinedRoomsRef.current.has(chat.id)
        ) {
          socket.emit("join_chat", chat.id)
          joinedRoomsRef.current.add(chat.id)
          console.log(`🔒 Socket joined private chat room: ${chat.id}`)
        }
      })
    }

    // If already connected, join immediately; otherwise wait for connect event
    if (socket.connected) {
      joinAllRooms()
    } else {
      socket.once("connect", joinAllRooms)
    }

    // Re-join rooms on reconnect (e.g., after network blip)
    const handleReconnect = () => {
      console.log("🔄 Socket reconnected — re-joining rooms...")
      joinedRoomsRef.current.clear()
      joinAllRooms()
    }
    socket.on("connect", handleReconnect)

    // Listen for incoming messages from other users
    const handleReceiveMessage = (data: {
      chatId: string
      teamId?: string
      message: Message
      chatType: string
      participants?: string[]
    }) => {
      const { chatId, teamId, message, chatType, participants } = data

      // Don't duplicate own messages
      if (message.senderId === currentUser.id) return

      // Permission check for private chats
      if (
        chatType === "private" &&
        participants &&
        !participants.includes(currentUser.id)
      ) {
        return
      }

      console.log("📩 Received message via Socket.io:", message.senderName, "says:", message.content)

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chatId)
        if (idx > -1) {
          // Deduplicate: check if this message already exists
          if (prev[idx].messages.some((m) => m.id === message.id)) return prev
          // Chat exists — append message
          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, message],
          }
          return updated
        }

        // Chat NOT found locally — auto-create it so the message appears immediately
        if (teamId) {
          console.log("📦 Auto-creating chat entry for:", chatId)
          return [...prev, {
            id: chatId,
            teamId,
            type: chatType === "private" ? "private" as const : "group" as const,
            participants: participants || [],
            name: chatType === "group" ? "General" : "Private Chat",
            messages: [message],
          }]
        }

        return prev
      })
    }

    socket.on("receive_message", handleReceiveMessage)

    return () => {
      socket.off("connect", handleReconnect)
      socket.off("receive_message", handleReceiveMessage)
    }
  }, [currentUser, teams])

  // ═══════════════════════════════════════════════
  // 3b. JOIN PRIVATE CHAT ROOMS VIA SOCKET
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (!currentUser) return
    const socket = getSocket()
    if (!socket.connected) return

    chats.forEach((chat) => {
      if (
        chat.type === "private" &&
        chat.participants.includes(currentUser.id) &&
        !joinedRoomsRef.current.has(chat.id)
      ) {
        socket.emit("join_chat", chat.id)
        joinedRoomsRef.current.add(chat.id)
        console.log(`🔒 Joined private chat room: ${chat.id}`)
      }
    })
  }, [currentUser, chats])

  // ═══════════════════════════════════════════════
  // 4. BATCH SYNC — FLUSH pendingSync TO MONGODB
  // ═══════════════════════════════════════════════
  const syncChatsToDB = useCallback(async () => {
    const pending = localStorage.getItem("pending_sync")
    if (!pending) return
    try {
      const messagesToSync = JSON.parse(pending)
      if (messagesToSync.length > 0) {
        // ① Clear cache BEFORE the request to prevent double-syncing
        localStorage.removeItem("pending_sync")
        await API.post("/chats/sync", { messages: messagesToSync })
        console.log(`✅ Synced ${messagesToSync.length} messages to MongoDB`)
      }
    } catch (err) {
      // ② If sync failed, restore unsynced messages so they retry
      const currentPending = localStorage.getItem("pending_sync")
      const existing = currentPending ? JSON.parse(currentPending) : []
      const pending_parsed = JSON.parse(pending)
      localStorage.setItem("pending_sync", JSON.stringify([...existing, ...pending_parsed]))
      console.error("❌ Failed to sync messages to MongoDB — will retry:", err)
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(syncChatsToDB, 30000)

    const handleUnload = () => {
      const pending = localStorage.getItem("pending_sync")
      if (pending) {
        const messagesToSync = JSON.parse(pending)
        if (messagesToSync.length > 0) {
          // Clear cache immediately so a returning tab doesn't double-sync
          localStorage.removeItem("pending_sync")
          const token = localStorage.getItem("token") || ""
          fetch("http://localhost:5000/api/chats/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ messages: messagesToSync }),
            keepalive: true,
          }).catch(() => {
            // If send failed, restore for next session
            localStorage.setItem("pending_sync", JSON.stringify(messagesToSync))
          })
          console.log(`📤 Flushing ${messagesToSync.length} messages on page unload`)
        }
      }
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => {
      clearInterval(intervalId)
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [syncChatsToDB])

  // ═══════════════════════════════════════════════
  // 5. DISCONNECT SOCKET ON UNMOUNT
  // ═══════════════════════════════════════════════
  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [])


  // ═══════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════
 const login = useCallback((user: any) => {
  const formattedUser = {
    ...user,
    id: user._id, // ✅ ADD THIS LINE
  }

  setCurrentUser(formattedUser)
  setIsAuthenticated(true)
  setUsers([formattedUser])
  localStorage.setItem("user", JSON.stringify(formattedUser))
}, [])

  const register = useCallback((user: any) => {
  const formattedUser = {
    ...user,
    id: user._id,
  }

  setCurrentUser(formattedUser)
  setIsAuthenticated(true)
  setUsers([formattedUser])
  localStorage.setItem("user", JSON.stringify(formattedUser))
}, [])

  const logout = useCallback(() => {
    disconnectSocket()
    setCurrentUser(null)
    setIsAuthenticated(false)
    setActiveTeamId(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("pending_sync")
  }, [])

  // ═══════════════════════════════════════════════
  // TEAM ACTIONS
  // ═══════════════════════════════════════════════
  const createTeam = useCallback(async (name: string, description: string) => {
  if (!currentUser) throw new Error("Not logged in")

  try {
    const team = await createTeamAPI(name, description)

    setTeams((prev) => [...prev, team])

    // create default chat from backend response OR locally if needed
    const groupChat: ChatRoom = {
      id: `c_${team.id}_general`,
      teamId: team.id,
      type: "group",
      participants: [currentUser.id],
      name: "General",
      messages: [],
    }

    setChats((prev) => [...prev, groupChat])

    // Join socket room for new team
    const socket = getSocket()
    if (socket.connected) {
      socket.emit("join_team", team.id)
    }

    return team
  } catch (err) {
    console.error("createTeam failed:", err)
    throw err
  }
}, [currentUser])


  const joinTeam = useCallback(async (code: string) => {
  if (!currentUser) throw new Error("Not logged in")

  try {
    const team = await joinTeamAPI(code)

    if (!team) return null

    // avoid duplicates
    setTeams((prev) => {
      const exists = prev.find((t) => t.id === team.id)
      if (exists) return prev
      return [...prev, team]
    })

    // ── Load existing chat history from MongoDB ──
    try {
      const historyRes = await API.get(`/chats/${team.id}`)
      const dbChats = historyRes.data
      if (Array.isArray(dbChats) && dbChats.length > 0) {
        setChats((prev) => {
          const newChats = [...prev]
          for (const dbChat of dbChats) {
            if (!newChats.some((c) => c.id === dbChat.chatId)) {
              newChats.push({
                id: dbChat.chatId,
                teamId: team.id,
                type: dbChat.type === "private" ? "private" : "group",
                participants: dbChat.participants || [],
                name: dbChat.type === "group" ? "General" : "Private Chat",
                messages: dbChat.messages || [],
              })
            }
          }
          return newChats
        })
      }
    } catch {
      // No history from DB yet, that's fine
    }

    // ── Ensure General group chat exists (even if not yet in DB) ──
    setChats((prev) => {
      const hasGroupChat = prev.some((c) => c.teamId === team.id && c.type === "group")
      if (!hasGroupChat) {
        return [...prev, {
          id: `c_${team.id}_general`,
          teamId: team.id,
          type: "group",
          participants: [currentUser.id],
          name: "General",
          messages: [],
        }]
      }
      return prev
    })

    // ── Create private chat with admin (for non-admin joiners) ──
    const admin = team.members.find((m: any) => m.role === "admin")
    if (admin && admin.userId.toString() !== currentUser.id) {
      const ids = [currentUser.id, admin.userId.toString()].sort()
      const privateChatId = `private_${team.id}_${ids[0]}_${ids[1]}`
      setChats((prev) => {
        if (!prev.some((c) => c.id === privateChatId)) {
          return [...prev, {
            id: privateChatId,
            teamId: team.id,
            type: "private" as const,
            participants: [currentUser.id, admin.userId.toString()],
            name: "Private Chat",
            messages: [],
          }]
        }
        return prev
      })
    }

    // Join socket room for joined team
    const socket = getSocket()
    if (socket.connected) {
      socket.emit("join_team", team.id)
    }

    return team
  } catch (err) {
    console.error("joinTeam failed:", err)
    return null
  }
}, [currentUser])

  // ═══════════════════════════════════════════════
  // TASK ACTIONS
  // ═══════════════════════════════════════════════
  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [...prev, { ...task, id: `tk${Date.now()}`, createdAt: new Date().toISOString() }])
  }, [])

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }, [])

  // ═══════════════════════════════════════════════
  // SEND MESSAGE — OPTIMISTIC UI + SOCKET + CACHE
  // ═══════════════════════════════════════════════
  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!currentUser) return
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toISOString(),
      type: "text",
    }

    // ① Optimistic UI — show message instantly for sender
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c
      )
    )
    console.log("✅ Message added to local UI instantly:", msg.content)

    // ② Cache in localStorage for batch sync
    const pendingStr = localStorage.getItem("pending_sync")
    const pending = pendingStr ? JSON.parse(pendingStr) : []
    pending.push({ chatId, message: msg })
    localStorage.setItem("pending_sync", JSON.stringify(pending))
    console.log("💾 Message added to local cache (pendingSync):", pending.length, "queued")

    // ③ Broadcast via Socket.io to team room
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      const socket = getSocket()
      if (socket.connected) {
        socket.emit("send_message", {
          chatId,
          teamId: chat.teamId,
          message: msg,
          chatType: chat.type,
          participants: chat.participants,
        })
        console.log("📡 Message broadcasted via Socket.io to room:", chat.teamId)
      }
    }

    // ④ Flush early if buffer hits 10 messages
    if (pending.length >= 10) {
      syncChatsToDB()
    }
  }, [currentUser, chats, syncChatsToDB])

  // ═══════════════════════════════════════════════
  // MEMBER ACTIONS
  // ═══════════════════════════════════════════════
  const removeMember = useCallback((teamId: string, userId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, members: t.members.filter((m) => m.userId !== userId) } : t,
      ),
    )
  }, [])

  const updateMemberRole = useCallback((teamId: string, userId: string, role: Role) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.map((m) => (m.userId === userId ? { ...m, role } : m)) }
          : t,
      ),
    )
  }, [])

  // ═══════════════════════════════════════════════
  // SELECTORS (with security filtering)
  // ═══════════════════════════════════════════════
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users])

  const getTeamChats = useCallback((teamId: string) => {
    return chats.filter((c) => {
      if (c.teamId !== teamId) return false
      if (c.type === "group") return true
      // Private: only show if current user is a participant
      if (c.type === "private" && currentUser && c.participants.includes(currentUser.id)) return true
      return false
    })
  }, [chats, currentUser])

  const getTeamTasks = useCallback((teamId: string) => tasks.filter((t) => t.teamId === teamId), [tasks])

  const getUserRole = useCallback(
    (teamId: string, userId: string) => {
      const team = teams.find((t) => t.id === teamId)
      return team?.members.find((m) => m.userId === userId)?.role
    },
    [teams],
  )


  // ═══════════════════════════════════════════════
  // START PRIVATE CHAT
  // ═══════════════════════════════════════════════
  const startPrivateChat = useCallback((teamId: string, memberId: string): string => {
    const myId = currentUser?.id || ""
    const ids = [myId, memberId].sort()
    const chatId = `private_${teamId}_${ids[0]}_${ids[1]}`

    // Check if it already exists
    const existing = chats.find((c) => c.id === chatId)
    if (existing) {
      // Ensure we've joined the socket room
      const socket = getSocket()
      if (socket.connected && !joinedRoomsRef.current.has(chatId)) {
        socket.emit("join_chat", chatId)
        joinedRoomsRef.current.add(chatId)
      }
      return chatId
    }

    // Create the private chat room in state
    const newChat: ChatRoom = {
      id: chatId,
      teamId,
      type: "private",
      participants: [myId, memberId],
      name: "Private Chat",
      messages: [],
    }

    setChats((prev) => [...prev, newChat])

    // Join the socket room for this private chat
    const socket = getSocket()
    if (socket.connected) {
      socket.emit("join_chat", chatId)
      joinedRoomsRef.current.add(chatId)
    }

    console.log("🔒 Private chat started:", chatId)
    return chatId
  }, [chats, currentUser])


  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        teams,
        tasks,
        chats,
        users,
        activeTeamId,
        login,
        register,
        logout,
        setActiveTeamId,
        createTeam,
        joinTeam,
        addTask,
        updateTaskStatus,
        deleteTask,
        sendMessage,
        removeMember,
        updateMemberRole,
        getUserById,
        getTeamChats,
        getTeamTasks,
        getUserRole,
        startPrivateChat,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
