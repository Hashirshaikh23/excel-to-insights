import { getSupabaseServerReadOnly } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UploadExcel } from "@/components/upload-excel"
import HistoryList from "@/components/history-list"
import { Button } from "@/components/ui/button"
import { signOut } from "../../lib/auth-actions"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerReadOnly()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <main className="container mx-auto max-w-5xl p-4 md:p-8 grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Dashboard</h1>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      <UploadExcel />

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Your History</h2>
        <HistoryList />
      </section>
    </main>
  )
}
