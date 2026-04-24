"use client";

import { useState, useEffect } from "react";
import type { TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateTaskModal } from "@/components/create-task-modal";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/app-context";

interface TaskBoardProps {
  teamId: string;
}

const columns: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export function TaskBoard({ teamId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const { getUserRole, currentUser } = useApp();

  const { teams } = useApp();

const team = teams.find((t) => t.id === teamId);

  const role = getUserRole(teamId, currentUser?.id || "");
  const isAdmin = role === "admin";

  const BASE_URL = "http://localhost:5000"

  // 🔥 Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${teamId}`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        toast.error("Backend error");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch");
      }

      setTasks(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    if (teamId) fetchTasks();
  }, [teamId]);

  // 🔥 Drag
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTaskId) return;

   // In handleDrop — fix the assignee check
const task = tasks.find((t) => t._id === draggedTaskId);

const taskAssigneeId = task?.assigneeId?._id || task?.assigneeId;
if (taskAssigneeId?.toString() !== currentUser?.id?.toString()) {
  toast.error("You can only update your own tasks");
  setDraggedTaskId(null);
  return;
}

    try {
      await fetch(`${BASE_URL}/api/tasks/${draggedTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          userId: currentUser?.id,
          role,
        }),
      });

      toast.success("Task updated");
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }

    setDraggedTaskId(null);
  };

  // 🔥 DELETE FIXED
  const deleteTask = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only admin can delete tasks");
      return;
    }

    try { // ✅ THIS WAS MISSING
      await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
        }),
      });

      toast.success("Task deleted");
      fetchTasks();

    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
  <div className="p-4">
    <div className="flex justify-between mb-4">
      <h2 className="text-xl font-bold">Task Board</h2>

      {isAdmin && (
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
       // In colTasks filter
const colTasks = tasks.filter((t) => {
  const assigneeId = t.assigneeId?._id || t.assigneeId;
  if (isAdmin) return t.status === col.id;
  return t.status === col.id && assigneeId?.toString() === currentUser?.id?.toString();
});

        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
            className="rounded-xl border border-border bg-card p-3"
          >
            <h3 className="font-semibold mb-2">
              {col.label} ({colTasks.length})
            </h3>

            <ScrollArea className="h-[400px]">
              {colTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks</p>
              )}

              {colTasks.map((task) => {
                // In canEdit
const canEdit = (task.assigneeId?._id || task.assigneeId)?.toString() === currentUser?.id?.toString();

                // ✅ find assigned member
                const member = team?.members.find(
                  (m: any) =>
                    (m.userId?._id || m.userId) === task.assigneeId
                );

               const memberName = task.assigneeId?.name || "Unknown";

                return (
                  <div
                    key={task._id}
                    draggable={canEdit}
                    onDragStart={() => handleDragStart(task._id)}
                    className="bg-background border border-border p-3 mb-2 rounded-lg shadow-sm cursor-grab hover:bg-accent"
                  >
                    <div className="flex justify-between">
                      <span>{task.title}</span>

                      {isAdmin && (
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>

                    <p className="text-xs mt-1 text-muted-foreground">
                      Assigned to: {memberName}
                    </p>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        );
      })}
    </div>

    <CreateTaskModal
      open={createOpen}
      onClose={() => {
        setCreateOpen(false);
        fetchTasks();
      }}
      teamId={teamId}
    />
  </div>
)}  