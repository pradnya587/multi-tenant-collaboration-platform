"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"

interface AuthScreenProps {
  onSuccess: () => void
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const { login, register } = useApp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (mode === "register" && !name.trim()) errs.name = "Name is required"
    if (!email.trim()) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email"
    if (!password) errs.password = "Password is required"
    else if (password.length < 6) errs.password = "Min 6 characters"
    if (mode === "register" && password !== confirmPassword) errs.confirmPassword = "Passwords don't match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validate()) return

  setIsLoading(true)

  try {
    if (mode === "login") {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      // store token
      localStorage.setItem("token", data.token)

// ✅ CORRECT
      login(data.user)
      
      toast.success("Welcome back!")
      onSuccess()

    } else {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Signup failed")
      }

      // ✅ ADD THIS LINE
      register(data)

      toast.success("Account created!")
      onSuccess()
    }
  } catch (error: any) {
    console.error(error)
    toast.error(error.message)
  }

  setIsLoading(false)
}



//firebase google sign-in
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || "Google login failed")
    }

    // ✅ store token
    localStorage.setItem("token", data.token)

    // ✅ login in your app context
    login(data.user)

    toast.success("Logged in with Google 🚀")
    onSuccess()

  } catch (error: any) {
    console.error(error)
    toast.error(error.message || "Google login failed")
  }
}



  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">

          <div className="flex flex-col items-center gap-2">
  <svg width="72" height="72" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
    {/* Orbit ring */}
    <circle cx="110" cy="110" r="72" fill="none" stroke="#e4e4e7" strokeWidth="1"/>

    {/* Cross connectors */}
    <line x1="110" y1="38"  x2="172" y2="74"  stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="172" y1="74"  x2="172" y2="146" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="172" y1="146" x2="110" y2="182" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="110" y1="182" x2="48"  y2="146" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48"  y1="146" x2="48"  y2="74"  stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48"  y1="74"  x2="110" y2="38"  stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48"  y1="74"  x2="172" y2="146" stroke="#ddd6fe" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 3"/>
    <line x1="172" y1="74"  x2="48"  y2="146" stroke="#ddd6fe" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 3"/>
    <line x1="110" y1="38"  x2="110" y2="182" stroke="#ddd6fe" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 3"/>

    {/* Center node */}
    <circle cx="110" cy="110" r="22" fill="#7C3AED"/>
    <circle cx="110" cy="110" r="10" fill="#ffffff"/>

    {/* Outer nodes */}
    <circle cx="110" cy="38"  r="10" fill="#7C3AED"/>
    <circle cx="172" cy="74"  r="8"  fill="#8B5CF6"/>
    <circle cx="172" cy="146" r="8"  fill="#8B5CF6"/>
    <circle cx="110" cy="182" r="10" fill="#7C3AED"/>
    <circle cx="48"  cy="146" r="8"  fill="#8B5CF6"/>
    <circle cx="48"  cy="74"  r="8"  fill="#8B5CF6"/>
    <circle cx="110" cy="38"  r="4"  fill="#ffffff"/>
    <circle cx="110" cy="182" r="4"  fill="#ffffff"/>
  </svg>

  <div className="text-center">
    <h1 className="text-xl font-extrabold tracking-tight text-foreground">
      Team<span className="text-primary">Sync</span>
    </h1>
    <p className="mt-0.5 text-sm text-muted-foreground">Collaboration, simplified.</p>
  </div>
</div>

        </div>

        {/* Form card */}
        <div className="glass rounded-2xl border border-border/60 p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login"
                ? "Enter your credentials to access your workspace"
                : "Create an account to start collaborating"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-11 rounded-xl bg-background/50 transition-colors focus:bg-background ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-destructive">{errors.name}</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 rounded-xl bg-background/50 transition-colors focus:bg-background ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 rounded-xl bg-background/50 pr-10 transition-colors focus:bg-background ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password}</p>
              )}
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 rounded-xl bg-background/50 transition-colors focus:bg-background ${
                    errors.confirmPassword ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="glow-primary mt-1 h-11 rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>


           
              <Button
  type="button"
  onClick={handleGoogleLogin}
  className="mt-3 h-11 w-full rounded-xl border"
>
  Continue with Google
</Button>


          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {"Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setErrors({}) }}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                {"Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrors({}) }}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Demo hint */}
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          {"Demo: use alice@example.com with any password"}
        </p>
      </div>
    </div>
  )
}