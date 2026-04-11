"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { User, Team, Task, ChatRoom, Message, TaskStatus, Role } from "@/lib/types"
import { useEffect } from "react"
import { createTeamAPI, joinTeamAPI } from "@/lib/team"
import { getMyTeamsAPI } from "@/lib/team"



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

useEffect(() => {
  const loadTeams = async () => {
    try {
      const data = await getMyTeamsAPI()
      setTeams(data)
    } catch (err) {
      console.error("Failed to load teams:", err)
    }
  }

  if (currentUser) {
    loadTeams()
  }
}, [currentUser])


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
    setCurrentUser(null)
    setIsAuthenticated(false)
    setActiveTeamId(null)
  }, [])

  const createTeam = useCallback(async (name: string, description: string) => {
  if (!currentUser) throw new Error("Not logged in")

  try {
    const team = await createTeamAPI(name, description)

    setTeams((prev) => [...prev, team])

    // create default chat from backend response OR locally if needed
    const groupChat: ChatRoom = {
      id: `c${Date.now()}`,
      teamId: team.id,   // ✅ FIXED
      type: "group",
      participants: [currentUser.id],
      name: "General",
      messages: [],
    }

    setChats((prev) => [...prev, groupChat])

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

    return team
  } catch (err) {
    console.error("joinTeam failed:", err)
    return null
  }
}, [currentUser])


  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [...prev, { ...task, id: `tk${Date.now()}`, createdAt: new Date().toISOString() }])
  }, [])

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }, [])

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
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c)))
  }, [currentUser])

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

  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users])

  const getTeamChats = useCallback((teamId: string) => chats.filter((c) => c.teamId === teamId), [chats])

  const getTeamTasks = useCallback((teamId: string) => tasks.filter((t) => t.teamId === teamId), [tasks])

  const getUserRole = useCallback(
    (teamId: string, userId: string) => {
      const team = teams.find((t) => t.id === teamId)
      return team?.members.find((m) => m.userId === userId)?.role
    },
    [teams],
  )


 

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
