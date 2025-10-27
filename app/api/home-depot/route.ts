import { NextRequest, NextResponse } from "next/server";
// Keep require to avoid bundling SerpAPI client in the browser
// and to sidestep ESM type issues.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getJson } = require("serpapi");

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Simple in-memory TTL cache scoped to this server instance
type CacheEntry<T> = { value: T; expiresAt: number };
const CACHE_TTL_MS = Number.parseInt(
  process.env.HD_CACHE_TTL_MS || "3600000",
  10
); // default 1 hour
const hdCache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string): T | undefined {
  const entry = hdCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    hdCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function writeCache<T>(key: string, value: T): void {
  hdCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(req: NextRequest) {
  try {
    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: "Missing SERPAPI_KEY" },
        { status: 500 }
      );
    }

    const { parsedItems, storeZip, storeId } = await req.json();

    const url = new URL(req.url);
    const cacheParam = url.searchParams.get("cache");
    const bypassCache =
      cacheParam === "0" ||
      cacheParam === "false" ||
      req.headers.get("x-cache-bust") === "1";

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const results = await Promise.all(
      parsedItems.map(async (q: string) => {
        const key = JSON.stringify({ q, storeZip, storeId });
        if (!bypassCache) {
          const cached = readCache<any>(key);
          if (cached !== undefined) {
            return cached;
          }
        }

        const searchResults = await getJson({
          api_key: SERPAPI_KEY,
          engine: "home_depot",
          q,
          country: "us",
          store_zip: storeZip,
          store_id: storeId,
        });

        writeCache(key, searchResults);
        return searchResults;
      })
    );

    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


