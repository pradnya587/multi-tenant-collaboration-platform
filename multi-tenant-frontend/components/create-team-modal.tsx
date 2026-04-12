"use client";

import { useState } from "react";
import { useApp } from "@/context/app-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ open, onClose }: Props) {
  const { createTeam } = useApp();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Team name required");
      return;
    }

    try {
      await createTeam(name, "");
      toast.success("Team created!");
      onClose();
      setName("");
    } catch {
      toast.error("Failed to create team");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}