"use client"

import { useState, useEffect } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClipboardList, Loader2 } from "lucide-react"
import { toast } from "sonner"

// ✅ FIX: missing import
import API from "@/lib/api"

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  teamId: string
}

export function CreateTaskModal({
  open,
  onClose,
  teamId,
}: CreateTaskModalProps) {
  const { currentUser, getUserRole } = useApp()

  const role = getUserRole(teamId, currentUser?.id || "")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [deadline, setDeadline] = useState("")
  const [members, setMembers] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const BASE_URL = "http://localhost:5000"
  
  // 🔥 FETCH MEMBERS
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token")

        // ✅ FIX: use axios API only (remove fetch + res.json)
        const res = await API.get(`/teams/${teamId}/members`)

        console.log("Members:", res.data)

        setMembers(res.data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load members")
      }
    }

    if (teamId && open) fetchMembers()
  }, [teamId, open])

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsCreating(true)

    try {
      // ❌ FIX: replace fetch with API (consistent + auto token)
      const res = await API.post("/tasks", {
        title,
        description,
        teamId,
        status: "todo",
        assigneeId: assigneeId || currentUser?.id,
        createdBy: currentUser?.id,
        deadline: deadline || new Date().toISOString(),
        role,
      })

      toast.success("Task created!")

      setTitle("")
      setDescription("")
      setAssigneeId("")
      setDeadline("")

      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Error creating task")
    }

    setIsCreating(false)
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
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* ✅ FIXED DROPDOWN */}
          <div className="flex flex-col gap-2">
            <Label>Assign To</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.userId?._id} value={m.userId?._id}>
                    {m.userId?.name || "No Name"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-2">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}