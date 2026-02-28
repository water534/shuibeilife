"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { NotionRenderer } from "react-notion-x";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ExtendedRecordMap } from "notion-types";
import { navigation } from "@/src/config/site";
import { NotionModal } from "@/components/NotionModal";

const Collection = dynamic(
  () => import("react-notion-x/build/third-party/collection").then((m) => m.Collection),
  { ssr: true }
);

const Equation = dynamic(
  () => import("react-notion-x/build/third-party/equation").then((m) => m.Equation),
  { ssr: false }
);

// @ts-ignore
const Code = dynamic(
  () =>
    Promise.all([
      import("react-notion-x/build/third-party/code").then((m) => m.Code),
      // @ts-ignore
      import("prismjs/components/prism-markup"),
      // @ts-ignore
      import("prismjs/components/prism-javascript"),
      // @ts-ignore
      import("prismjs/components/prism-typescript"),
      // @ts-ignore
      import("prismjs/components/prism-bash"),
    ]).then(([CodeComponent]) => CodeComponent as any),
  { ssr: false }
) as any;


const EmptyComponent = () => null;

interface NotionPageClientProps {
  recordMap: ExtendedRecordMap;
}

/** 从 recordMap 根 block 提取页面标题 */
function extractPageTitle(recordMap: ExtendedRecordMap): string {
  const rootPageId = Object.keys(recordMap.block)[0];
  if (!rootPageId) return "";
  const rootBlock = recordMap.block[rootPageId]?.value;
  if (!rootBlock) return "";
  const titleProp = (rootBlock as any).properties?.title;
  if (!titleProp) return "";
  // Notion title 格式：[[["文字"]]] 或 [["文字"]]
  return titleProp.flat(2).filter((s: unknown) => typeof s === "string").join("");
}

/** 统一图片代理逻辑，block 参数由 react-notion-x 传入 */
function mapImageUrl(url: string | undefined, block?: any): string {
  if (!url) return "";
  console.log("[mapImageUrl] url:", url?.slice(0, 60), "block keys:", block ? Object.keys(block) : null);
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `https://www.notion.so${url}`;
  const base = `/api/notion-image?url=${encodeURIComponent(url)}`;
  if (url.startsWith("attachment:")) {
    const blockId = block?.id || block?.value?.id;
    if (blockId) {
      return `${base}&blockId=${encodeURIComponent(blockId)}`;
    }
  }
  return base;
}

/** 判断当前路径是否为 L2 列表页（navigation 中的页面） */
function isListPage(pathname: string): boolean {
  return navigation.some((item) =>
    pathname.includes(item.href.split("?")[0])
  );
}

export function NotionPageClient({ recordMap }: NotionPageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDetailPage = pathname.startsWith("/post/");
  const isL2 = isDetailPage && isListPage(pathname);
  const isL4 = isDetailPage && !isL2;

  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecordMap, setModalRecordMap] = useState<ExtendedRecordMap | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalPageId, setModalPageId] = useState<string>("");

  // 提取 L4 页面标题（在 sanitize 前读取）
  const pageTitle = useMemo(() => {
    if (!isL4) return "";
    return extractPageTitle(recordMap);
  }, [recordMap, isL4]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = useCallback(async (pageId: string, title: string) => {
    setModalTitle(title);
    setModalPageId(pageId);
    setModalOpen(true);
    setModalRecordMap(null);

    try {
      const response = await fetch(`/api/notion/${pageId}`);
      if (response.ok) {
        const data = await response.json();
        setModalRecordMap(data.recordMap);
      }
    } catch (error) {
      console.error("Failed to fetch modal content:", error);
    }
  }, []);

  // L2 页面：检测 ?modal= 参数，自动打开 Modal
  useEffect(() => {
    if (!isMounted || !isL2) return;
    const modalId = searchParams.get("modal");
    if (modalId) {
      openModal(modalId, "");
    }
  }, [isMounted, isL2, searchParams, openModal]);

  // L2 页面：卡片点击 → 打开 Modal（L3）
  useEffect(() => {
    if (!isMounted || !isL2) return;

    const handleCardClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest(".notion-collection-card");

      if (card) {
        const href = card.getAttribute("href");
        if (href && href.startsWith("/post/")) {
          e.preventDefault();
          e.stopPropagation();

          const pageId = href.replace("/post/", "").split("?")[0];
          const titleEl = card.querySelector(".notion-page-title");
          const title = titleEl?.textContent || "";

          openModal(pageId, title);
        }
      }
    };

    const galleryGrid = document.querySelector(".notion-gallery-grid") as HTMLElement | null;
    if (galleryGrid) {
      galleryGrid.addEventListener("click", handleCardClick, true);
    }

    return () => {
      if (galleryGrid) {
        galleryGrid.removeEventListener("click", handleCardClick, true);
      }
    };
  }, [isMounted, isL2, openModal]);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!isMounted) return;
    const idx = navigation.findIndex((item) => pathname.includes(item.href.split("?")[0]));

    let resolvedIdx = idx;
    if (idx >= 0) {
      // L2 页面：记录当前激活项
      sessionStorage.setItem("nav-active-index", String(idx));
    } else {
      // L4 页面：读取来源 L2 的激活项
      const stored = sessionStorage.getItem("nav-active-index");
      resolvedIdx = stored !== null ? parseInt(stored, 10) : -1;
    }

    setActiveIndex(resolvedIdx);
    if (resolvedIdx >= 0 && navRefs.current[resolvedIdx]) {
      const el = navRefs.current[resolvedIdx]!;
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [pathname, isMounted]);

  const isActive = (href: string) => pathname.includes(href.split("?")[0]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => {
      setModalRecordMap(null);
      setModalTitle("");
    }, 350);
  }, []);

  // 数据层物理隔离：详情页渲染前抹除 properties.title
  const sanitizedRecordMap = useMemo(() => {
    if (!isDetailPage) return recordMap;
    const rootPageId = Object.keys(recordMap.block)[0];
    if (!rootPageId) return recordMap;
    const rootBlock = recordMap.block[rootPageId]?.value;
    if (!rootBlock) return recordMap;
    const patchedBlock = {
      ...recordMap.block,
      [rootPageId]: {
        ...recordMap.block[rootPageId],
        value: {
          ...rootBlock,
          properties: rootBlock.properties
            ? { ...rootBlock.properties, title: undefined }
            : rootBlock.properties,
        },
      },
    };
    return { ...recordMap, block: patchedBlock };
  }, [recordMap, isDetailPage]);

  // SSR 骨架
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f9f9f9]">
        <main className="max-w-[1024px] mx-auto px-6 py-12 w-full">
          <nav className="flex justify-between mb-16 h-10">
            {navigation.map((item) => (
              <div key={item.id} className="w-24 h-5 bg-gray-200 rounded" />
            ))}
          </nav>
          <div className="grid grid-cols-3 gap-6 min-h-[50vh]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl min-h-[300px]" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <main className="max-w-[1024px] mx-auto px-6 py-12 w-full">

        {/* 顶部导航 */}
        <nav
          className="relative flex justify-between items-center w-full mb-16"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
        >
          {navigation.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              ref={(el) => { navRefs.current[idx] = el; }}
              className="relative py-2 text-base tracking-[0.05em] no-underline transition-all duration-300"
              style={{
                color: isActive(item.href) ? "#000000" : "#86868B",
                fontWeight: isActive(item.href) ? 700 : 400,
                opacity: isActive(item.href) ? 1 : 0.6,
              }}
            >
              {item.label}
            </Link>
          ))}
          {/* 滑动下划线 */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "-2px",
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              height: "2px",
              background: "linear-gradient(to right, transparent, #FB923C, transparent)",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: activeIndex >= 0 ? 1 : 0,
            }}
          />
        </nav>

        {/* L2：返回首页按钮 */}
        {isL2 && (
          <div className="page-back-row">
            <Link href="/giants" className="btn-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回
            </Link>
          </div>
        )}

        {/* L4：标题 + 返回上一页 */}
        {isL4 && (
          <div className="post-header">
            <button
              onClick={() => {
                const from = searchParams.get("from");
                const currentId = pathname.replace("/post/", "").split("?")[0];
                if (from) {
                  router.push(`/post/${from}?modal=${currentId}`);
                } else {
                  router.back();
                }
              }}
              className="btn-back"
              aria-label="返回上一页"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回
            </button>
            {pageTitle && (
              <h1 className="post-header-title">{pageTitle}</h1>
            )}
          </div>
        )}

        {/* Notion 内容 */}
        <div className="notion-content-fade-in" id="notion-custom-container">
          <NotionRenderer
            recordMap={sanitizedRecordMap as any}
            fullPage={false}
            disableHeader={true}
            darkMode={false}
            showTableOfContents={false}
            previewImages={true}
            mapPageUrl={(pageId) => `/post/${pageId}`}
            mapImageUrl={mapImageUrl}
            components={{
              Collection,
              Equation,
              Code,
              nextImage: Image,
              nextLink: Link,
              Header: EmptyComponent,
              PageTitle: EmptyComponent,
            } as any}
          />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="max-w-[1024px] mx-auto px-6 py-12 border-t border-gray-100 text-center">
        <Link href="/giants" className="footer-link">
          巨人的肩膀丨一人公司问题知识库
        </Link>
        <Link href="/giants" className="footer-sub">
          (点击返回知识库)
        </Link>
      </footer>

      <NotionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        recordMap={modalRecordMap}
        title={modalTitle}
        onNavigate={(pageId) => {
          // 带上来源分类页 ID，供 L4 返回时恢复 Modal
          const fromId = pathname.replace("/post/", "").split("?")[0];
          handleCloseModal();
          router.push(`/post/${pageId}?from=${fromId}`);
        }}
      />
    </div>
  );
}
