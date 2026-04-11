export type Role = "admin" | "member"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "offline" | "away"
}

export type Team = {
  _id?: string
  id?: string
  name: string
  description: string
  code: string
  createdBy: string
  members: {
    userId: string
    role: string
    joinedAt: string
  }[]
}

export interface TeamMember {
  userId: {
    _id: string
    name: string
    email: string
  }
  role: Role
  joinedAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  type: "text" | "file"
}

export interface ChatRoom {
  id: string
  teamId: string
  type: "group" | "private"
  participants: string[]
  messages: Message[]
  name?: string
}


 
export type TaskStatus = "todo" | "in-progress" | "completed"

export interface Task {
  id: string
  teamId: string
  title: string
  description: string
  status: TaskStatus
  assigneeId: string
  createdBy: string
  deadline: string
  createdAt: string
}
