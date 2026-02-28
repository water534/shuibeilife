"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { NotionRenderer } from "react-notion-x";
import Image from "next/image";
import Link from "next/link";
import type { ExtendedRecordMap } from "notion-types";

const Collection = dynamic(
  () => import("react-notion-x/build/third-party/collection").then((m) => m.Collection),
  { ssr: true }
);

const EmptyComponent = () => null;

interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordMap: ExtendedRecordMap | null;
  title?: string;
  onNavigate?: (pageId: string) => void;
}

function mapImageUrl(url: string | undefined, block?: any): string {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `https://www.notion.so${url}`;
  const base = `/api/notion-image?url=${encodeURIComponent(url)}`;
  if (url.startsWith("attachment:")) {
    const blockId = block?.id || block?.value?.id;
    if (blockId) return `${base}&blockId=${encodeURIComponent(blockId)}`;
  }
  return base;
}

export function NotionModal({ isOpen, onClose, recordMap, title, onNavigate }: NotionModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.classList.remove("modal-open");
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // L3 内卡片点击 → 关闭 Modal + 跳转 L4
  useEffect(() => {
    if (!isOpen || !onNavigate || !contentRef.current) return;

    const handleCardClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest(".notion-collection-card");
      if (card) {
        const href = card.getAttribute("href");
        if (href && href.startsWith("/post/")) {
          e.preventDefault();
          e.stopPropagation();
          const pageId = href.replace("/post/", "").split("?")[0];
          onNavigate(pageId);
        }
      }
    };

    const el = contentRef.current;
    el.addEventListener("click", handleCardClick, true);
    return () => el.removeEventListener("click", handleCardClick, true);
  }, [isOpen, onNavigate, recordMap]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isAnimating && !isOpen) return null;

  return (
    <div
      className="notion-modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: isVisible ? "blur(10px)" : "blur(0px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        transition: "background-color 0.35s cubic-bezier(0.23, 1, 0.32, 1), backdrop-filter 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        id="peek-container"
        className="notion-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "85vh",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.92) translateY(24px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* 顶部标题栏 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
          gap: "12px",
        }}>
          {title && (
            <h2 style={{
              flex: 1,
              fontSize: "16px",
              fontWeight: 600,
              color: "#1A1A1A",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}>
              {title}
            </h2>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background-color 0.2s, transform 0.2s",
            }}
            aria-label="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "32px 48px 48px" }}>
          {recordMap ? (
            <div className="modal-notion-content">
              <NotionRenderer
                recordMap={recordMap as any}
                fullPage={false}
                disableHeader={true}
                darkMode={false}
                showTableOfContents={false}
                previewImages={true}
                mapPageUrl={(pageId) => `/post/${pageId}`}
                mapImageUrl={mapImageUrl}
                components={{
                  Collection,
                  nextImage: Image,
                  nextLink: Link,
                  Header: EmptyComponent,
                  PageTitle: EmptyComponent,
                } as any}
              />
            </div>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "240px",
              color: "#86868B",
              fontSize: "15px",
            }}>
              加载中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
