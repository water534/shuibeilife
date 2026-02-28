"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAccessControl, hasAccess, applyKey } from "@/lib/auth";
import { navigation } from "@/src/config/site";

const GIANTS_HREF = "/giants";
const RIPPLE_HREF = "/ripple";

// ========================================
// 行内密钥输入框（带橙色呼吸边框）
// ========================================

function InlineKeyInput({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const role = applyKey(value);
    if (role) {
      onSuccess();
    } else {
      setError(true);
      setValue("");
      setTimeout(() => setError(false), 1200);
    }
  };

  return (
    <>
      {/* 呼吸边框动画 */}
      <style>{`
        @keyframes breath-border {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,69,0,0.3); }
          50%       { box-shadow: 0 0 0 3px rgba(255,69,0,0.15); }
        }
        .input-breath {
          animation: breath-border 2s ease-in-out infinite;
          border-radius: 12px;
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        className="input-breath"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 12,
          padding: "24px 20px",
          zIndex: 10,
          border: "1px solid rgba(255,69,0,0.25)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="输入重构密钥"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${error ? "#FF4500" : "rgba(0,0,0,0.15)"}`,
            outline: "none",
            fontSize: 14,
            color: "#1A1A1A",
            padding: "6px 0",
            textAlign: "center",
            letterSpacing: "0.1em",
            fontFamily: "inherit",
            transition: "border-color 0.2s ease",
          }}
        />
        {error && (
          <span style={{ fontSize: 11, color: "#FF4500", letterSpacing: "0.05em" }}>
            密钥无效
          </span>
        )}
        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={handleSubmit}
            style={{
              fontSize: 12,
              color: "#FF4500",
              background: "none",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontFamily: "inherit",
            }}
          >
            连接 →
          </button>
          <button
            onClick={onCancel}
            style={{
              fontSize: 12,
              color: "#86868B",
              background: "none",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontFamily: "inherit",
            }}
          >
            取消
          </button>
        </div>
      </div>
    </>
  );
}

// ========================================
// 入口卡片（标题/描述始终清晰，仅背景区模糊）
// ========================================

function EntryCard({
  title,
  description,
  href,
  locked,
  onUnlocked,
}: {
  title: string;
  description: string;
  href: string;
  locked: boolean;
  onUnlocked: () => void;
}) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);

  const handleClick = () => {
    if (locked) {
      setShowInput(true);
    } else {
      router.push(href);
    }
  };

  const handleSuccess = () => {
    setShowInput(false);
    onUnlocked();
    setTimeout(() => router.push(href), 300);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        flex: "1 1 0",
        minWidth: 0,
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        cursor: "pointer",
        background: "#fff",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#FF4500";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e5e5";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* 16:9 背景占位区（仅此区域模糊） */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9
          background: "#f5f5f7",
          overflow: "hidden",
        }}
      >
        {locked && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(245,245,247,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1A1A1A" strokeWidth="1.5" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* 文字区：始终清晰，不受模糊影响 */}
      <div style={{ padding: "20px 22px 24px" }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#1A1A1A",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "#86868B",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
            margin: "8px 0 0",
          }}
        >
          {description}
        </p>
      </div>

      {/* 行内输入框（覆��整个卡片） */}
      {showInput && (
        <InlineKeyInput
          onSuccess={handleSuccess}
          onCancel={() => setShowInput(false)}
        />
      )}
    </div>
  );
}

// ========================================
// 主页内容
// ========================================

function HomeContent() {
  const { role, isLoading } = useAccessControl();
  const [localRole, setLocalRole] = useState(role);

  useEffect(() => {
    setLocalRole(role);
  }, [role]);

  const canAccessGiants = hasAccess(localRole, "giants");
  const canAccessRipple = hasAccess(localRole, "ripple");

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .entry-cards { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>
      <main
        className="notion-content-fade-in"
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

          {/* 品牌区 */}
          <header style={{ paddingTop: "20vh", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 56px)",
                fontWeight: 700,
                color: "#1A1A1A",
                letterSpacing: "0.15em",
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              自由、松弛、赚钱
            </h1>
            <p
              style={{
                marginTop: 16,
                fontSize: "clamp(14px, 2vw, 17px)",
                color: "#86868B",
                letterSpacing: "0.05em",
                lineHeight: 1.8,
              }}
            >
              创造由自己定义的生活。
            </p>
            <div
              style={{
                margin: "20px auto 0",
                width: 120,
                height: 1,
                background: "linear-gradient(to right, transparent, #FF4500, transparent)",
                opacity: 0.6,
              }}
            />
          </header>

          {/* 入口区 */}
          <section style={{ marginTop: 60 }}>
            <div
              className="entry-cards"
              style={{ display: "flex", gap: 20, width: "100%" }}
            >
              <EntryCard
                title="巨人的肩膀"
                description="一人公司问题知识库"
                href={GIANTS_HREF}
                locked={!isLoading && !canAccessGiants}
                onUnlocked={() => setLocalRole("giants")}
              />
              <EntryCard
                title="涟漪计划"
                description="社群会员专属，解锁全部权益。"
                href={RIPPLE_HREF}
                locked={!isLoading && !canAccessRipple}
                onUnlocked={() => setLocalRole("ripple")}
              />
            </div>
          </section>

          {/* 页脚 */}
          <footer
            style={{
              marginTop: 80,
              paddingTop: 32,
              paddingBottom: 48,
              textAlign: "center",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#86868B", lineHeight: 1.8, letterSpacing: "0.03em" }}>
              水杯不装水丨一人公司长期主义实践者
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#86868B", lineHeight: 1.8, letterSpacing: "0.03em" }}>
              需要解锁内容+v：shbbzhsh
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}>
      <HomeContent />
    </Suspense>
  );
}
