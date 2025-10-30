import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error in profile ensure:", authError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id" })
      
    if (error) {
      console.error("Profile upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Profile ensure error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
