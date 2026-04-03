"use client"

import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageCircle,
  UserCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useState } from "react"

export type NavPage = "dashboard" | "teams" | "tasks" | "chat" | "profile"

interface AppSidebarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
}

const navItems: { id: NavPage; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "teams", label: "My Teams", icon: Users },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: UserCircle },
]

export function AppSidebar({ activePage, onNavigate }: AppSidebarProps) {
  const { currentUser, logout, teams } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  const myTeams = teams.filter((t) =>
    t.members.some((m) => m.userId === currentUser?.id)
  )

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        {/* Header */}
        <div className={cn("flex h-16 shrink-0 items-center border-b border-border/50", collapsed ? "justify-center px-2" : "justify-between px-4")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="glow-primary flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-mono text-base font-bold tracking-tight text-foreground">TeamSync</span>
            </div>
          )}
          {collapsed && (
            <div className="glow-primary flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
            {navItems.map((item) => {
              const isActive = activePage === item.id
              const btn = (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive && "text-primary")} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="border-border bg-popover text-popover-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }
              return btn
            })}
          </nav>

          {!collapsed && myTeams.length > 0 && (
            <div className="mt-6 px-3">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Teams
              </p>
              <div className="flex flex-col gap-0.5">
                {myTeams.slice(0, 5).map((team) => (
                  <button
                    key={team.id}
                    onClick={() => onNavigate("teams")}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {team.name.charAt(0)}
                    </div>
                    <span className="truncate">{team.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/50">
          {/* Controls row */}
          <div className={cn("flex items-center border-b border-border/30", collapsed ? "flex-col gap-1 p-2" : "justify-between px-3 py-2")}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><ThemeToggle /></div>
                </TooltipTrigger>
                <TooltipContent side="right" className="border-border bg-popover text-popover-foreground">Toggle theme</TooltipContent>
              </Tooltip>
            ) : (
              <ThemeToggle />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                  {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-border bg-popover text-popover-foreground">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* User */}
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center p-3" : "p-3")}>
            <div className="relative">
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar">
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                  {currentUser?.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{currentUser?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={logout}
                      className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border-border bg-popover text-popover-foreground">Sign out</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
