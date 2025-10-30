// Creates an isolated API so we don't have to modify your existing /api/history route.
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        get: async (name: string) => (await cookieStore.get(name))?.value,
        set: async (name: string, value: string, options: any) => {
          await cookieStore.set({ name, value, ...options })
        },
        remove: async (name: string, options: any) => {
          await cookieStore.set({ name, value: "", ...options })
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Next.js 15 dynamic APIs require awaiting params
    const resolvedParams = 'then' in (context as any).params ? await (context as any).params : (context as any).params
    const id = resolvedParams?.id
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabase.from("analyses").delete().match({ id, user_id: user.id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
