"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  teamId: string
}

export function CreateTaskModal({ open, onClose, teamId }: CreateTaskModalProps) {
  const { addTask, currentUser, teams, getUserById } = useApp()
  const team = teams.find((t) => t.id === teamId)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    setIsCreating(true)
    await new Promise((r) => setTimeout(r, 400))
    addTask({
      teamId,
      title,
      description,
      status: "todo",
      assigneeId: assigneeId || currentUser!.id,
      createdBy: currentUser!.id,
      deadline: deadline || new Date().toISOString().split("T")[0],
    })
    toast.success("Task created!")
    setTitle("")
    setDescription("")
    setAssigneeId("")
    setDeadline("")
    setIsCreating(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-border/40 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ClipboardList className="h-5 w-5 text-primary" /> Create New Task
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new task to the board.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Title</Label>
            <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Description</Label>
            <Textarea placeholder="Describe the task..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Assign To</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {team?.members.map((m) => {
                  const user = getUserById(m.userId)
                  return (
                    <SelectItem key={m.userId} value={m.userId} className="rounded-lg">
                      {user?.name ?? "Unknown"}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Deadline</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="rounded-xl border-border/50">Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
