"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router, supabase.auth])

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try to ensure profile, but don't fail if it doesn't work
      try {
        const response = await fetch("/api/profile/ensure", { method: "POST" })
        if (!response.ok) {
          console.warn("Profile ensure failed, but continuing...")
        }
      } catch (profileError) {
        console.warn("Profile ensure error:", profileError)
      }
      
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-pretty">Sign in</CardTitle>
          <CardDescription>Access your dashboard and analysis history</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              Sign in
            </Button>
            <Button type="button" variant="outline" onClick={() => location.assign("/register")}>
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
