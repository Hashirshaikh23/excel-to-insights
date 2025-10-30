import { getSupabaseServerReadOnly } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const supabase = await getSupabaseServerReadOnly()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch profile and simple usage stats
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  if (!profile || profile.role !== "admin") {
    return (
      <main className="container mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Not authorized. Make sure profiles and admin RPC exist: run scripts/sql/012_create_profiles.sql and
          scripts/sql/013_admin_rpc.sql, then set your user to role='admin' (see 014_seed_admin.sql).
        </p>
      </main>
    )
  }

  const { data: users, error: usageError } = await supabase.rpc("admin_user_usage")

  return (
    <main className="container mx-auto max-w-5xl p-6 grid gap-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      <div className="grid gap-3">
        <h2 className="text-lg font-medium">User Usage</h2>
        {usageError && (
          <p className="text-sm text-red-600">
            Failed to load usage. Apply SQL scripts: 010_create_analyses.sql, 011_analyses_policies.sql,
            012_create_profiles.sql, and 013_admin_rpc.sql. Then set an admin user via 014_seed_admin.sql.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Analyses</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u: any) => (
                <tr key={u.user_id} className="border-b">
                  <td className="py-2 pr-4">{u.user_id}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
