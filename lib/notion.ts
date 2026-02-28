import { NotionAPI } from "notion-client";
import type { ExtendedRecordMap } from "notion-types";

async function getSignedUrl(attachmentUrl: string, blockId: string): Promise<string | null> {
  const token = process.env.NOTION_TOKEN_V2;
  const activeUser = process.env.NOTION_ACTIVE_USER;
  if (!token || !blockId) return null;

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
        urls: [{ url: attachmentUrl, permissionRecord: { table: "block", id: blockId } }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.signedUrls?.[0] ?? null;
  } catch {
    return null;
  }
}

/** 将 recordMap 中所有 attachment: 图片 URL 替换为签名 URL */
async function resolveAttachmentUrls(recordMap: ExtendedRecordMap): Promise<ExtendedRecordMap> {
  const blocks = recordMap.block;
  const tasks: Promise<void>[] = [];

  for (const [blockId, blockData] of Object.entries(blocks)) {
    const block = (blockData as any)?.value;
    if (!block || block.type !== "image") continue;

    const source: string | undefined = block.properties?.source?.[0]?.[0];
    if (!source?.startsWith("attachment:")) continue;

    tasks.push(
      getSignedUrl(source, blockId).then((signed) => {
        console.log("[notion] blockId:", blockId, "signed:", signed ? signed.slice(0, 60) : "null");
        if (signed) {
          block.properties.source[0][0] = signed;
        }
      })
    );
  }

  await Promise.all(tasks);
  return recordMap;
}

export async function getNotionPage(pageId: string): Promise<ExtendedRecordMap> {
  const notion = new NotionAPI({
    authToken: process.env.NOTION_TOKEN_V2,
    activeUser: process.env.NOTION_ACTIVE_USER,
  });

  const recordMap = await notion.getPage(pageId);
  await resolveAttachmentUrls(recordMap);
  return recordMap;
}
