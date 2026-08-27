import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const DEMO_BASE = "https://api.coingecko.com/api/v3";
const PRO_BASE = "https://pro-api.coingecko.com/api/v3";

const ALLOWED_PATH =
  /^(nfts\/markets|nfts\/list|nfts\/market_chart\/global|nfts\/[a-zA-Z0-9_-]+(?:\/market_chart)?|search\/trending|coins\/markets)(\?.*)?$/;

function getApiKey(): string {
  const key = process.env.COINGECKO_API_KEY;
  if (!key) throw new Error("CoinGecko API key not configured");
  return key.replace(/^["']|["']$/g, "").trim();
}

function isAllowedPath(path: string): boolean {
  const normalized = path.replace(/^\//, "");
  if (normalized.includes("..")) return false;
  return ALLOWED_PATH.test(normalized);
}

export async function GET(request: NextRequest) {
  const path = new URL(request.url).searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path query parameter" }, { status: 400 });
  }

  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: "Path is not allowlisted" }, { status: 400 });
  }

  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CoinGecko API key not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const isDemo = apiKey.startsWith("CG-");
  const base = isDemo ? DEMO_BASE : PRO_BASE;
  const headerName = isDemo ? "x-cg-demo-api-key" : "x-cg-pro-api-key";
  const url = `${base}/${path.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        [headerName]: apiKey,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `CoinGecko API error: ${res.status} ${res.statusText}`, details: text.slice(0, 500) },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch from CoinGecko", details: message },
      { status: 502 },
    );
  }
}
