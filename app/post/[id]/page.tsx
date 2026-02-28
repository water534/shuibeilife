import { notFound } from "next/navigation";
import { getNotionPage } from "@/lib/notion";
import { NotionPageClient } from "@/components/NotionPageClient";
import { AccessGuard } from "@/components/AccessGuard";

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  try {
    const recordMap = await getNotionPage(id);
    return (
      <AccessGuard requiredRole="giants">
        <NotionPageClient recordMap={recordMap} />
      </AccessGuard>
    );
  } catch (error) {
    console.error("Failed to fetch Notion page:", error);
    notFound();
  }
}
