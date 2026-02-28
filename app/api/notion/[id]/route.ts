import { NextRequest, NextResponse } from "next/server";
import { getNotionPage } from "@/lib/notion";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const recordMap = await getNotionPage(id);

    return NextResponse.json({ recordMap }, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("Failed to fetch Notion page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
