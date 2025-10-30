"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import * as htmlToImage from "html-to-image"
import jsPDF from "jspdf"

// Three.js for simple 3D columns
import * as THREE from "three"

type Row = Record<string, any>

export function ChartRenderer({
  data,
  xKey,
  yKey,
  chartType,
}: {
  data: Row[] | null
  xKey: string | null
  yKey: string | null
  chartType: "line" | "bar" | "scatter" | "pie" | "3d-column" | null
}) {
  console.log("Props received by ChartRenderer:", { data, xKey, yKey, chartType })
  console.log("Raw Data:", data)

  const containerRef = useRef<HTMLDivElement>(null!)

  const validateKey = (key: string | null, data: Row[] | null) => {
    if (!key || !data) return false
    return data.some((row) => key in row)
  }

  if (!validateKey(xKey, data)) {
    console.error("Invalid xKey provided:", xKey)
    xKey = Object.keys(data?.[0] || {})[0] || null // Fallback to the first key
  }
  if (!validateKey(yKey, data) && chartType !== "pie") {
    console.error("Invalid yKey provided:", yKey)
    yKey = Object.keys(data?.[0] || {}).find((key) => typeof data?.[0]?.[key] === "number") || null // Fallback to a numeric key
  }

  const toNum = (v: any) => {
    if (typeof v === "number") return v
    if (typeof v === "string") {
      const num = Number(v.toString().replace(/,/g, ""))
      return Number.isFinite(num) ? num : 0
    }
    return 0
  }

  const safeData = useMemo(() => {
    if (!yKey || !validateKey(yKey, data)) {
      console.warn("Invalid yKey or data is null. Returning empty safeData.")
      return data?.map((row) => ({ ...row, fallbackKey: 0 })) || []
    }
    return (data || []).map((r) => {
      const n = toNum(r[yKey!])
      return Number.isFinite(n) ? { ...r, [yKey!]: n } : { ...r, [yKey!]: 0 }
    })
  }, [data, yKey])

  const pieData = useMemo(() => {
    if (chartType !== "pie" || !validateKey(xKey, data)) {
      return [{ name: "Fallback", value: 1 }]
    }
    const map = new Map<string, number>()
    for (const r of data || []) {
      const k = String(r[xKey!] || "Unknown")
      const vRaw = r[yKey!]
      const v = Number.isFinite(toNum(vRaw)) ? toNum(vRaw) : 1
      map.set(k, (map.get(k) || 0) + v)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [data, xKey, yKey, chartType])

  console.log("Transformed Safe Data:", safeData)
  console.log("Transformed Pie Data:", pieData)

  console.log("Rendering chart type:", chartType);
  console.log("Safe Data:", safeData);
  console.log("Pie Data:", pieData);

  function exportPNG(ref: React.RefObject<HTMLDivElement>) {
    if (!ref.current) {
      console.error("Container reference is null.")
      return
    }
    htmlToImage.toPng(ref.current).then((dataUrl) => {
      const link = document.createElement("a")
      link.download = "chart.png"
      link.href = dataUrl
      link.click()
    })
  }

  function exportPDF(ref: React.RefObject<HTMLDivElement>) {
    if (!ref.current) {
      console.error("Container reference is null.")
      return
    }
    htmlToImage.toPng(ref.current).then((dataUrl) => {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(dataUrl, "PNG", 16, 16, pageWidth - 32, pageHeight - 32)
      pdf.save("chart.pdf")
    })
  }

  return (
    <div className="grid gap-3">
      <div ref={containerRef} className="rounded-md border p-3">
        {chartType !== "3d-column" ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={safeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey!} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={yKey!} stroke="#1D4ED8" dot={false} />
                </LineChart>
              ) : chartType === "bar" ? (
                <BarChart data={safeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey!} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yKey!} fill="#1D4ED8" />
                </BarChart>
              ) : chartType === "scatter" ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey!} name={xKey!} />
                  <YAxis dataKey={yKey!} name={yKey!} />
                  <Tooltip />
                  <Legend />
                  <Scatter data={safeData} fill="#14B8A6" />
                </ScatterChart>
              ) : (
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "#1F2937" : "#14B8A6"} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <ThreeColumn data={data || []} xKey={xKey!} yKey={yKey!} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => exportPNG(containerRef)} className="bg-blue-600 hover:bg-blue-700">
          Download PNG
        </Button>
        <Button variant="outline" onClick={() => exportPDF(containerRef)}>
          Download PDF
        </Button>
      </div>
    </div>
  )
}

function ThreeColumn({ data, xKey, yKey }: { data: Row[]; xKey: string; yKey: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !mountRef.current) return

    const width = mountRef.current.clientWidth || 640
    const height = 320

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    mountRef.current.innerHTML = ""
    mountRef.current.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(5, 10, 7.5)
    scene.add(dir)

    // Axes and bars
    const group = new THREE.Group()
    scene.add(group)

    const values = data.map((d) => Number(d[yKey] ?? 0)).filter((v) => Number.isFinite(v))
    const maxV = values.length ? Math.max(...values) : 1
    const barWidth = 0.6
    const gap = 0.3

    const material = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
    data.slice(0, 30).forEach((d, i) => {
      const val = Number(d[yKey] ?? 0)
      const h = Number.isFinite(val) ? (val / (maxV || 1)) * 5 + 0.05 : 0.05
      const geometry = new THREE.BoxGeometry(barWidth, h, barWidth)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(i * (barWidth + gap), h / 2, 0)
      group.add(mesh)
    })

    // Grid ground
    const grid = new THREE.GridHelper(50, 50, 0x9ca3af, 0xe5e7eb)
    grid.position.y = 0
    scene.add(grid)

    // Position camera
    camera.position.set(5, 6, 12)
    camera.lookAt(group.position)

    let frameId: number
    const animate = () => {
      group.rotation.y += 0.006
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth || width
      const h = height
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      material.dispose()
      scene.clear()
    }
  }, [mounted, data, xKey, yKey])

  return <div className="h-[320px] w-full" ref={mountRef} aria-label="3D Column Chart" />
}
