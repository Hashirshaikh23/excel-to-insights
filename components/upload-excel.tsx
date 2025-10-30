"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChartRenderer } from "./visuals/chart-renderer"
// SheetJS
import * as XLSX from "xlsx"
// SWR mutate for auto-refresh of history after save
import { mutate as swrMutate } from "swr"

type Row = Record<string, any>

const ALLOWED_TYPES = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

export function UploadExcel({
  onSaved,
}: {
  onSaved?: (savedId: string) => void
}) {
  const [fileName, setFileName] = useState<string>("")
  const [rows, setRows] = useState<Row[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [xKey, setXKey] = useState<string>("")
  const [yKey, setYKey] = useState<string>("")
  const [chartType, setChartType] = useState<"line" | "bar" | "scatter" | "pie" | "3d-column">("line")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json: Row[] = XLSX.utils.sheet_to_json(ws, { raw: true })
      setRows(json)

      const cols = Object.keys(json[0] || {})
      // Filter out __EMPTY columns and provide better names
      const filteredCols = cols.filter(col => !col.startsWith('__EMPTY'))
      setColumns(filteredCols)

      // detect numeric columns by sampling and coercing numeric-looking strings
      const sample = json.slice(0, 200)
      const numericCandidates = filteredCols.filter((c) => {
        let numericCount = 0
        let total = 0
        for (const r of sample) {
          const v = r?.[c]
          if (v === null || v === undefined || v === "") continue
          total++
          const n =
            typeof v === "number" ? v : typeof v === "string" ? Number(v.toString().replace(/,/g, "")) : Number.NaN
          if (Number.isFinite(n)) numericCount++
        }
        return numericCount >= 3 && numericCount / Math.max(total, 1) >= 0.5
      })

      // defaults to avoid empty selectors
      const defaultX = filteredCols[0] || ""
      const defaultY = numericCandidates.find((c) => c !== defaultX) || numericCandidates[0] || ""
      setXKey(defaultX)
      setYKey(defaultY)
    }
    reader.onerror = () => setError("Failed to read the file.")
    reader.readAsArrayBuffer(file)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type) && !f.name.endsWith(".xls") && !f.name.endsWith(".xlsx")) {
      setError("Please upload a valid .xls or .xlsx file.")
      return
    }
    setFileName(f.name)
    parseFile(f)
  }

  const numericColumns = useMemo(() => {
    if (!rows.length) return []
    const cols = Object.keys(rows[0] || {})
    const filteredCols = cols.filter(col => !col.startsWith('__EMPTY'))
    const sample = rows.slice(0, 200)
    return filteredCols.filter((c) => {
      let numericCount = 0
      let total = 0
      for (const r of sample) {
        const v = r?.[c]
        if (v === null || v === undefined || v === "") continue
        total++
        const n =
          typeof v === "number" ? v : typeof v === "string" ? Number(v.toString().replace(/,/g, "")) : Number.NaN
        if (Number.isFinite(n)) numericCount++
      }
      return numericCount >= 3 && numericCount / Math.max(total, 1) >= 0.5
    })
  }, [rows])

  async function saveAnalysis() {
    try {
      setSaving(true)
      setError(null)
      setSavedId(null)

      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: fileName,
          columns,
          x_key: xKey,
          y_key: yKey,
          chart_type: chartType,
          sample: rows.slice(0, 100),
        }),
      })
      if (!res.ok) {
        let serverError = "Save failed"
        try {
          const j = await res.json()
          if (j?.error) serverError = j.error
        } catch {}
        throw new Error(serverError)
      }
      const j = await res.json()

      setSavedId(j.id)
      // refresh any SWR hooks bound to this key (HistoryList)
      swrMutate("/api/history")
      onSaved?.(j.id)
    } catch (e: any) {
      setError(e?.message || "Failed to save analysis.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Upload Excel</CardTitle>
        <CardDescription>Choose your file, map columns, and generate charts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <label htmlFor="excel" className="text-sm">
            Excel file (.xls/.xlsx)
          </label>
          <Input id="excel" type="file" accept=".xls,.xlsx" onChange={onFileInput} />
          {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
        </div>

        {!!columns.length && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm">X Axis</label>
              <Select value={xKey} onValueChange={setXKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Y Axis</label>
              <Select value={yKey} onValueChange={setYKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select numeric column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c} disabled={!numericColumns.includes(c)}>
                      {c}
                      {!numericColumns.includes(c) ? " (non-numeric)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Chart type</label>
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line (2D)</SelectItem>
                  <SelectItem value="bar">Bar (2D)</SelectItem>
                  <SelectItem value="scatter">Scatter (2D)</SelectItem>
                  <SelectItem value="pie">Pie (2D)</SelectItem>
                  <SelectItem value="3d-column">3D Column</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {rows.length > 0 && xKey && (yKey || chartType === "pie") ? (
          <div className="grid gap-4">
            <ChartRenderer data={rows} xKey={xKey} yKey={yKey} chartType={chartType} />
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveAnalysis}
                disabled={saving || !fileName || !xKey || (!yKey && chartType !== "pie")}
              >
                {saving ? "Saving..." : "Save to History"}
              </Button>
              {savedId && <p className="text-sm text-green-600">Saved</p>}
              <AIInsights data={rows} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600">Please upload a valid file and configure chart settings.</p>
        )}
      </CardContent>
    </Card>
  )
}

function AIInsights({ data }: { data: Row[] }) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setText(null)
    setError(null)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample: data.slice(0, 100) }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "" }))
        throw new Error(j?.error || "Insights unavailable (connect xAI to enable).")
      }
      const j = await res.json()
      setText(j.text)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="outline" onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "AI Insights (optional)"}
      </Button>
      {text && <p className="text-sm leading-relaxed">{text}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
