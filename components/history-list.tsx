"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Item = {
  id: string
  file_name: string
  chart_type: string
  x_key: string
  y_key: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HistoryList() {
  const { data, error, isLoading, mutate } = useSWR<{ items: Item[] }>("/api/history", fetcher)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    const confirmed = typeof window !== "undefined" ? window.confirm("Delete this history item?") : true
    if (!confirmed) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Delete failed with status ${res.status}`)
      }
      await mutate()
    } catch (err: any) {
      console.error("[v0] Delete error:", err?.message)
      if (typeof window !== "undefined") alert(err?.message || "Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (error) return <p className="text-sm text-red-600">Failed to load history.</p>
  const items = data?.items ?? []

  return (
    <div className="grid gap-3">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{it.file_name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Chart:</span> {it.chart_type}
              </p>
              <p>
                <span className="text-muted-foreground">X:</span> {it.x_key}{" "}
                <span className="text-muted-foreground">Y:</span> {it.y_key}
              </p>
              <p className="text-muted-foreground">{new Date(it.created_at).toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => mutate()} disabled={!!deletingId}>
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(it.id)}
                  disabled={deletingId === it.id}
                  aria-label={`Delete history item ${it.file_name}`}
                  title="Delete this history item"
                >
                  {deletingId === it.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
