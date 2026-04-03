"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { User, Team, Task, ChatRoom, Message, TaskStatus, Role } from "@/lib/types"
import { mockUsers, mockTeams, mockTasks, mockChats } from "@/lib/mock-data"

interface AppContextType {
  currentUser: User | null
  isAuthenticated: boolean
  teams: Team[]
  tasks: Task[]
  chats: ChatRoom[]
  users: User[]
  activeTeamId: string | null
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
  setActiveTeamId: (id: string | null) => void
  createTeam: (name: string, description: string) => Team
  joinTeam: (code: string) => Team | null
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

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0])
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [chats, setChats] = useState<ChatRoom[]>(mockChats)
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const users = mockUsers

  const login = useCallback((email: string, _password: string) => {
    const user = mockUsers.find((u) => u.email === email)
    if (user) {
      setCurrentUser(user)
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const register = useCallback((name: string, email: string, _password: string) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase(),
      status: "online",
    }
    setCurrentUser(newUser)
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    setActiveTeamId(null)
  }, [])

  const createTeam = useCallback((name: string, description: string) => {
    const team: Team = {
      id: `t${Date.now()}`,
      name,
      description,
      code: `${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      createdBy: currentUser!.id,
      members: [{ userId: currentUser!.id, role: "admin", joinedAt: new Date().toISOString() }],
    }
    setTeams((prev) => [...prev, team])
    const groupChat: ChatRoom = {
      id: `c${Date.now()}`,
      teamId: team.id,
      type: "group",
      participants: [currentUser!.id],
      name: "General",
      messages: [],
    }
    setChats((prev) => [...prev, groupChat])
    return team
  }, [currentUser])

  const joinTeam = useCallback((code: string) => {
    const team = teams.find((t) => t.code === code)
    if (team && currentUser && !team.members.some((m) => m.userId === currentUser.id)) {
      const updated = teams.map((t) =>
        t.id === team.id
          ? { ...t, members: [...t.members, { userId: currentUser.id, role: "member" as Role, joinedAt: new Date().toISOString() }] }
          : t,
      )
      setTeams(updated)
      setChats((prev) =>
        prev.map((c) =>
          c.teamId === team.id && c.type === "group"
            ? { ...c, participants: [...c.participants, currentUser.id] }
            : c,
        ),
      )
      return updated.find((t) => t.id === team.id)!
    }
    return team ?? null
  }, [teams, currentUser])

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
