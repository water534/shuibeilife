"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { NotionRenderer } from "react-notion-x";
import Image from "next/image";
import Link from "next/link";
import type { ExtendedRecordMap } from "notion-types";

const Collection = dynamic(
  () => import("react-notion-x/build/third-party/collection").then((m) => m.Collection),
  { ssr: true }
);

interface ModalPageProps {
  isOpen: boolean;
  onClose: () => void;
  recordMap: ExtendedRecordMap | null;
  title?: string;
}

export function ModalPage({ isOpen, onClose, recordMap, title }: ModalPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isAnimating && !isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(8px)" : "blur(0px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        transition: "background-color 0.3s cubic-bezier(0.23, 1, 0.32, 1), backdrop-filter 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "85vh",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "background-color 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          aria-label="关闭"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L13 13M1 13L13 1"
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "32px 40px 40px 40px",
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#000",
                marginBottom: "24px",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </h2>
          )}

          {recordMap ? (
            <div className="modal-notion-content">
              <NotionRenderer
                recordMap={recordMap as any}
                fullPage={false}
                darkMode={false}
                showTableOfContents={false}
                previewImages={true}
                mapPageUrl={(pageId) => `/post/${pageId}`}
                components={{
                  Collection,
                  nextImage: Image,
                  nextLink: Link,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                color: "#86868B",
                fontSize: "15px",
              }}
            >
              加载中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
