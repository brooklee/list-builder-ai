import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory TTL cache for parsed build plans
type CacheEntry<T> = { value: T; expiresAt: number };
const PARSE_CACHE_TTL_MS = Number.parseInt(
  process.env.PARSE_CACHE_TTL_MS || "300000",
  10
); // default 5 minutes
const parseCache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string): T | undefined {
  const entry = parseCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    parseCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function writeCache<T>(key: string, value: T): void {
  parseCache.set(key, { value, expiresAt: Date.now() + PARSE_CACHE_TTL_MS });
}

export async function POST(req: NextRequest) {
  try {
    const { buildPlan } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const cacheParam = url.searchParams.get("cache");
    const bypassCache =
      cacheParam === "0" ||
      cacheParam === "false" ||
      req.headers.get("x-cache-bust") === "1";

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const cacheKey = JSON.stringify({ buildPlan, model });
    if (!bypassCache) {
      const cached = readCache<any>(cacheKey);
      if (cached !== undefined) {
        return NextResponse.json(cached);
      }
    }
    const response = await openai.chat.completions.create({
      model: model,
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

    // Strip code fences if present and parse JSON safely
    let jsonText = raw.trim();
    if (jsonText.startsWith("```")) {
      const match = jsonText.match(/```[a-zA-Z]*\n([\s\S]*?)\n```/);
      jsonText = match ? match[1].trim() : jsonText.replace(/```/g, "");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      // Fall back to empty list if unparsable
      parsed = [];
    }

    // Normalize to expected shape
    const normalized = Array.isArray(parsed)
      ? parsed.map((m: any) => {
          const item = m.item ?? m.item_name ?? m.name ?? "";
          let quantity = m.quantity;
          if (typeof quantity === "string") {
            const num = parseFloat(quantity.replace(/[^0-9.]/g, ""));
            quantity = Number.isFinite(num) ? num : 1;
          } else if (typeof quantity !== "number") {
            quantity = 1;
          }
          const details = m.details ?? m.length ?? m.size ?? "";
          const total = m.total;
          const price = m.price;
          return { item, quantity, details, total, price };
        })
      : [];

    writeCache(cacheKey, normalized);
    return NextResponse.json(normalized);
  } catch (err: unknown) {
    console.error("API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}