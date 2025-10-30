import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto max-w-4xl p-6 md:py-16 grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-4xl font-semibold text-pretty">Excel → Insightful Charts</h1>
        <p className="text-muted-foreground max-w-prose">
          Upload any .xls or .xlsx, pick your X/Y axes, and generate interactive 2D and 3D charts. Save your analyses
          and manage them in your dashboard.
        </p>
      </header>
      <div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
      <ul className="text-sm text-muted-foreground list-disc pl-5 grid gap-1">
        <li>2D Line/Bar/Scatter/Pie </li>
        <li>3D Column</li>
        <li>Download PNG/PDF</li>
        <li>History & Admin dashboard</li>
        <li>AI insights</li>
      </ul>
    </main>
  )
}
