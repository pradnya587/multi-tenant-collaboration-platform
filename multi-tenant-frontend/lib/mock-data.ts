import type { User, Team, ChatRoom, Task } from "./types"

export const mockUsers: User[] = [
  { id: "u1", name: "Alice Johnson", email: "alice@example.com", avatar: "AJ", status: "online" },
  { id: "u2", name: "Bob Smith", email: "bob@example.com", avatar: "BS", status: "online" },
  { id: "u3", name: "Carol Davis", email: "carol@example.com", avatar: "CD", status: "away" },
  { id: "u4", name: "Dan Wilson", email: "dan@example.com", avatar: "DW", status: "offline" },
  { id: "u5", name: "Eve Martinez", email: "eve@example.com", avatar: "EM", status: "online" },
]

export const mockTeams: Team[] = [
  {
    id: "t1",
    name: "Product Design",
    description: "Design team for the main product",
    code: "PD-2024-XK7",
    createdBy: "u1",
    members: [
      { userId: "u1", role: "admin", joinedAt: "2024-01-10" },
      { userId: "u2", role: "member", joinedAt: "2024-01-12" },
      { userId: "u3", role: "member", joinedAt: "2024-01-15" },
      { userId: "u5", role: "admin", joinedAt: "2024-01-18" },
    ],
  },
  {
    id: "t2",
    name: "Engineering",
    description: "Core engineering team",
    code: "ENG-2024-AB3",
    createdBy: "u1",
    members: [
      { userId: "u1", role: "admin", joinedAt: "2024-02-01" },
      { userId: "u4", role: "member", joinedAt: "2024-02-05" },
      { userId: "u2", role: "member", joinedAt: "2024-02-10" },
    ],
  },
  {
    id: "t3",
    name: "Marketing",
    description: "Marketing and growth team",
    code: "MKT-2024-QW9",
    createdBy: "u3",
    members: [
      { userId: "u3", role: "admin", joinedAt: "2024-03-01" },
      { userId: "u5", role: "member", joinedAt: "2024-03-05" },
    ],
  },
]

export const mockChats: ChatRoom[] = [
  {
    id: "c1",
    teamId: "t1",
    type: "group",
    participants: ["u1", "u2", "u3", "u5"],
    name: "General",
    messages: [
      { id: "m1", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Hey team! Let's sync on the new dashboard design.", timestamp: "2024-06-10T09:00:00Z", type: "text" },
      { id: "m2", senderId: "u2", senderName: "Bob Smith", senderAvatar: "BS", content: "Sounds good! I've been working on the wireframes.", timestamp: "2024-06-10T09:02:00Z", type: "text" },
      { id: "m3", senderId: "u3", senderName: "Carol Davis", senderAvatar: "CD", content: "I'll share the color palette options later today.", timestamp: "2024-06-10T09:05:00Z", type: "text" },
      { id: "m4", senderId: "u5", senderName: "Eve Martinez", senderAvatar: "EM", content: "Great! Let's aim to finalize by end of week.", timestamp: "2024-06-10T09:10:00Z", type: "text" },
      { id: "m5", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Agreed. I'll set up a review session for Thursday.", timestamp: "2024-06-10T09:15:00Z", type: "text" },
    ],
  },
  {
    id: "c2",
    teamId: "t1",
    type: "private",
    participants: ["u1", "u2"],
    messages: [
      { id: "m6", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Bob, can you share the latest mockups?", timestamp: "2024-06-10T10:00:00Z", type: "text" },
      { id: "m7", senderId: "u2", senderName: "Bob Smith", senderAvatar: "BS", content: "Sure! Sending them over now.", timestamp: "2024-06-10T10:02:00Z", type: "text" },
    ],
  },
  {
    id: "c3",
    teamId: "t2",
    type: "group",
    participants: ["u1", "u4", "u2"],
    name: "General",
    messages: [
      { id: "m8", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Sprint planning starts at 2pm.", timestamp: "2024-06-10T11:00:00Z", type: "text" },
      { id: "m9", senderId: "u4", senderName: "Dan Wilson", senderAvatar: "DW", content: "I'll be there. Need to discuss the API refactor.", timestamp: "2024-06-10T11:05:00Z", type: "text" },
    ],
  },
]

export const mockTasks: Task[] = [
  { id: "tk1", teamId: "t1", title: "Design login page", description: "Create a modern login page design", status: "completed", assigneeId: "u2", createdBy: "u1", deadline: "2024-06-15", createdAt: "2024-06-01" },
  { id: "tk2", teamId: "t1", title: "Dashboard wireframe", description: "Create wireframe for the main dashboard", status: "in-progress", assigneeId: "u3", createdBy: "u1", deadline: "2024-06-20", createdAt: "2024-06-05" },
  { id: "tk3", teamId: "t1", title: "Icon set design", description: "Design custom icon set for the app", status: "todo", assigneeId: "u5", createdBy: "u1", deadline: "2024-06-25", createdAt: "2024-06-08" },
  { id: "tk4", teamId: "t1", title: "Color palette update", description: "Update the color palette based on feedback", status: "todo", assigneeId: "u2", createdBy: "u1", deadline: "2024-06-22", createdAt: "2024-06-09" },
  { id: "tk5", teamId: "t2", title: "API authentication", description: "Implement JWT authentication for the API", status: "in-progress", assigneeId: "u4", createdBy: "u1", deadline: "2024-06-18", createdAt: "2024-06-02" },
  { id: "tk6", teamId: "t2", title: "Database migration", description: "Migrate database to new schema", status: "todo", assigneeId: "u2", createdBy: "u1", deadline: "2024-06-28", createdAt: "2024-06-10" },
  { id: "tk7", teamId: "t1", title: "Typography review", description: "Review and finalize typography choices", status: "in-progress", assigneeId: "u1", createdBy: "u5", deadline: "2024-06-19", createdAt: "2024-06-07" },
  { id: "tk8", teamId: "t2", title: "CI/CD setup", description: "Set up continuous integration pipeline", status: "completed", assigneeId: "u1", createdBy: "u1", deadline: "2024-06-12", createdAt: "2024-06-01" },
]
