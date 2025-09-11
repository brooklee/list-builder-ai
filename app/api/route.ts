import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { buildPlan } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You're a helpful assistant. Return only a JSON array of materials extracted from the build plan with item name, quantity, and details like size or type when possible.",
        },
        {
          role: "user",
          content: buildPlan,
        },
      ],
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content || "[]";

    let materials;
    try {
      materials = JSON.parse(raw);
    } catch (err) {
      materials = [{ error: "Failed to parse GPT output", raw }];
    }

    return NextResponse.json(materials);
  } catch (err: unknown) {
    console.error("API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}