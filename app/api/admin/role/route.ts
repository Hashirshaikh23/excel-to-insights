import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: NextRequest) {
  const res = new NextResponse()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: any) => {
        res.cookies.set({ name, value, ...options })
      },
      remove: (name: string, options: any) => {
        res.cookies.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })

  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId, role } = await req.json()
  if (!userId || !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true }, { status: 200, headers: res.headers })
}
