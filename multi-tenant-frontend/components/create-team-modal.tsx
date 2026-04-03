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
import { Copy, Check, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface CreateTeamModalProps {
  open: boolean
  onClose: () => void
}

export function CreateTeamModal({ open, onClose }: CreateTeamModalProps) {
  const { createTeam } = useApp()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Team name is required")
      return
    }
    setIsCreating(true)
    await new Promise((r) => setTimeout(r, 500))
    const team = createTeam(name, description)
    setCreatedCode(team.code)
    setIsCreating(false)
    toast.success("Team created successfully!")
  }

  const handleCopy = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode)
      setCopied(true)
      toast.success("Code copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setCreatedCode(null)
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl border-border/40 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {createdCode ? (
              <>
                <Check className="h-5 w-5 text-success" /> Team Created
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary" /> Create New Team
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {createdCode
              ? "Share the invite code with your team members."
              : "Set up a new team workspace for collaboration."}
          </DialogDescription>
        </DialogHeader>
        {createdCode ? (
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Invite Code
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="flex-1 font-mono text-2xl font-bold tracking-widest text-primary">{createdCode}</code>
                  <Button variant="outline" size="icon" onClick={handleCopy} className="rounded-xl border-border/50">
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-name" className="text-sm font-medium text-foreground">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g., Product Design"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-desc" className="text-sm font-medium text-foreground">Description</Label>
              <Textarea
                id="team-desc"
                placeholder="What is this team about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl border-border/50">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreating ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
