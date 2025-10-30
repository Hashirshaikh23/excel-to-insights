import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: NextRequest) {
  try {
    const { sample } = await req.json()
    const prompt = `You are a data analyst. Given JSON rows from an Excel dataset, write a concise executive summary (bulleted key insights, trends, outliers) in under 120 words.

JSON:
${JSON.stringify(sample).slice(0, 8000)}`

    let text: string

    if (process.env.XAI_API_KEY) {
      const result = await generateText({ model: xai("grok-4"), prompt })
      text = result.text
    } else if (process.env.GROQ_API_KEY) {
      // Updated from deprecated "llama-3.1-70b-versatile" to a supported model
      const result = await generateText({ model: groq("llama-3.1-8b-instant"), prompt })
      text = result.text
    } else {
      return NextResponse.json(
        { error: "No AI provider configured. Set XAI_API_KEY (preferred) or GROQ_API_KEY." },
        { status: 400 },
      )
    }

    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to generate insights" }, { status: 500 })
  }
}
