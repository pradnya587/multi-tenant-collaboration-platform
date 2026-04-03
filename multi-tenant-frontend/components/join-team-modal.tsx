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
import { Users, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface JoinTeamModalProps {
  open: boolean
  onClose: () => void
}

export function JoinTeamModal({ open, onClose }: JoinTeamModalProps) {
  const { joinTeam } = useApp()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error("Please enter a team code")
      return
    }
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const team = joinTeam(code)
    if (team) {
      toast.success(`Joined "${team.name}" successfully!`)
      setCode("")
      onClose()
    } else {
      toast.error("Invalid team code. Please try again.")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-border/40 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" /> Join a Team
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the invite code shared by your team admin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-code" className="text-sm font-medium text-foreground">Team Code</Label>
            <Input
              id="team-code"
              placeholder="e.g., PD-2024-XK7"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-11 rounded-xl font-mono tracking-widest"
            />
            <p className="text-xs text-muted-foreground/70">
              Try: PD-2024-XK7, ENG-2024-AB3, or MKT-2024-QW9
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="rounded-xl border-border/50">
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Joining..." : "Join Team"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
