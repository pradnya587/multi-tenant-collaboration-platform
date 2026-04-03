"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreateTaskModal } from "@/components/create-task-modal"
import { Plus, Calendar, Trash2, ChevronRight, ChevronLeft, GripVertical } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface TaskBoardProps {
  teamId: string
}

const columns: { id: TaskStatus; label: string; dotColor: string; countBg: string }[] = [
  { id: "todo", label: "To Do", dotColor: "bg-muted-foreground/40", countBg: "bg-muted text-muted-foreground" },
  { id: "in-progress", label: "In Progress", dotColor: "bg-primary", countBg: "bg-primary/15 text-primary" },
  { id: "completed", label: "Completed", dotColor: "bg-success", countBg: "bg-success/15 text-success" },
]

export function TaskBoard({ teamId }: TaskBoardProps) {
  const { getTeamTasks, updateTaskStatus, deleteTask, getUserById, getUserRole, currentUser } = useApp()
  const tasks = getTeamTasks(teamId)
  const role = getUserRole(teamId, currentUser?.id ?? "")
  const isAdmin = role === "admin"
  const [createOpen, setCreateOpen] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      const task = tasks.find((t) => t.id === draggedTaskId)
      if (task) {
        if (!isAdmin && task.assigneeId !== currentUser?.id) {
          toast.error("You can only update your own tasks")
          setDraggedTaskId(null)
          return
        }
        updateTaskStatus(draggedTaskId, status)
        toast.success("Task updated!")
      }
      setDraggedTaskId(null)
    }
  }

  const moveTask = (taskId: string, direction: "left" | "right") => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const colIdx = columns.findIndex((c) => c.id === task.status)
    const newIdx = direction === "right" ? colIdx + 1 : colIdx - 1
    if (newIdx >= 0 && newIdx < columns.length) {
      updateTaskStatus(taskId, columns[newIdx].id)
      toast.success("Task moved!")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Task Board</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks total</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)} size="sm" className="glow-primary rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg">
            <Plus className="mr-1.5 h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className="flex flex-col rounded-2xl border border-border/40 bg-background/50"
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full", col.dotColor)} />
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                </div>
                <Badge className={cn("text-[10px] font-bold", col.countBg, "hover:" + col.countBg.split(" ")[0])}>
                  {colTasks.length}
                </Badge>
              </div>

              {/* Tasks */}
              <ScrollArea className="max-h-[50vh] min-h-[120px]">
                <div className="flex flex-col gap-2.5 p-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-1 py-10 text-muted-foreground/50">
                      <p className="text-xs">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assignee = getUserById(task.assigneeId)
                      const canEdit = isAdmin || task.assigneeId === currentUser?.id
                      return (
                        <div
                          key={task.id}
                          draggable={canEdit}
                          onDragStart={() => handleDragStart(task.id)}
                          className={cn(
                            "group cursor-grab rounded-xl border border-border/30 bg-card p-3.5 transition-all duration-200 hover:border-border/60 hover:shadow-md active:cursor-grabbing",
                            draggedTaskId === task.id && "scale-[0.97] opacity-50",
                          )}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
                              <h4 className="text-sm font-semibold text-foreground">{task.title}</h4>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  deleteTask(task.id)
                                  toast.success("Task deleted")
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-primary/10 text-[8px] font-bold text-primary">
                                  {assignee?.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-muted-foreground">{assignee?.name?.split(" ")[0]}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {canEdit && (
                                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                  {col.id !== "todo" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                      onClick={() => moveTask(task.id, "left")}
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {col.id !== "completed" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                      onClick={() => moveTask(task.id, "right")}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(task.deadline), "MMM d")}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} teamId={teamId} />
    </div>
  )
}
