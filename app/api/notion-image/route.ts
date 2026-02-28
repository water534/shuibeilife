import { NextRequest, NextResponse } from "next/server";

async function fetchWithRetry(url: string, retries = 1): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.ok) return res;
    if (i < retries) await new Promise((r) => setTimeout(r, 300));
    if (i === retries) return res;
  }
  throw new Error("fetch failed");
}

/** 调用 getSignedFileUrls，需要正确的 image block ID */
async function getSignedUrl(attachmentUrl: string, blockId: string): Promise<string | null> {
  const token = process.env.NOTION_TOKEN_V2;
  const activeUser = process.env.NOTION_ACTIVE_USER;
  if (!token || !blockId) return null;

  // getSignedFileUrls 需要不带 query string 的原始 attachment: URL
  const cleanUrl = attachmentUrl.split("?")[0];

  try {
    const res = await fetch("https://www.notion.so/api/v3/getSignedFileUrls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `token_v2=${token}${activeUser ? `; notion_user_id=${activeUser}` : ""}`,
        "notion-audit-log-platform": "web",
        "x-notion-active-user-header": activeUser || "",
      },
      body: JSON.stringify({
        urls: [
          {
            url: cleanUrl,
            permissionRecord: { table: "block", id: blockId },
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notion-image] getSignedFileUrls error:", res.status, text.slice(0, 200));
      return null;
    }
    const data = await res.json();
    return data?.signedUrls?.[0] ?? null;
  } catch (err) {
    console.error("[notion-image] getSignedUrl error:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const blockId = request.nextUrl.searchParams.get("blockId") || "";

  console.log("[notion-image] url:", url?.slice(0, 50), "blockId:", blockId || "(empty)");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    let resolvedUrl = url;

    if (url.startsWith("attachment:")) {
      const signed = await getSignedUrl(url, blockId);
      if (!signed) {
        return NextResponse.json({ error: "Failed to resolve attachment URL" }, { status: 502 });
      }
      resolvedUrl = signed;
    }

    const response = await fetchWithRetry(resolvedUrl, 1);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[notion-image] GET error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
