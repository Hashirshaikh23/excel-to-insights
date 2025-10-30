import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ items: [] })

  const { data, error } = await supabase
    .from("analyses")
    .select("id,file_name,chart_type,x_col,y_col,created_at") // was x_key,y_key
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ items: [] })

  // Map DB fields to UI-expected keys without changing other components
  const items = (data || []).map((row: any) => ({
    ...row,
    x_key: row.x_col,
    y_key: row.y_col,
  }))
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { file_name, columns, x_key, y_key, chart_type, sample } = body || {}

  if (!file_name) {
    return NextResponse.json({ error: "file_name is required" }, { status: 400 })
  }
  if (!x_key) {
    return NextResponse.json({ error: "x_key is required" }, { status: 400 })
  }
  if (!y_key && chart_type !== "pie") {
    return NextResponse.json({ error: "y_key is required for this chart type" }, { status: 400 })
  }

  const config = {
    columns: columns ?? null,
    sample: sample ?? null,
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      file_name,
      x_col: x_key,
      y_col: y_key ?? null,
      chart_type,
      config,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ id: data.id })
}
