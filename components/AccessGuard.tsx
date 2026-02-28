"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useAccessControl, hasAccess, applyKey } from "@/lib/auth";
import type { Role } from "@/lib/auth";

// ========================================
// 涟漪动画组件
// ========================================

function RippleEffect({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span
      className="ripple-ring"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "transparent",
        border: "2px solid #FF4500",
        animation: "ripple-expand 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        pointerEvents: "none",
      }}
    />
  );
}

// ========================================
// 锁定态 UI
// ========================================

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [ripple, setRipple] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const role = applyKey(value);
    if (role) {
      setError(false);
      setRipple(true);
      // 涟漪动画结束后解锁
      setTimeout(() => {
        onUnlock();
      }, 750);
    } else {
      setError(true);
      setValue("");
      // 短暂抖动后清除错误状态
      setTimeout(() => setError(false), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="flex flex-col items-center gap-8 w-full px-8"
        style={{ maxWidth: 360 }}
      >
        {/* 锁图标 */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0.25 }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* 输入区域 */}
        <div className="relative w-full" style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="输入重构密钥以连接空间"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${error ? "#FF4500" : "rgba(0,0,0,0.2)"}`,
              outline: "none",
              fontSize: 15,
              color: "#1A1A1A",
              padding: "8px 0",
              textAlign: "center",
              letterSpacing: "0.1em",
              fontFamily: "inherit",
              transition: "border-color 0.2s ease",
            }}
          />

          {/* 涟漪效果 */}
          <RippleEffect active={ripple} />

          {/* 错误提示 */}
          {error && (
            <p
              style={{
                position: "absolute",
                bottom: -22,
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: 11,
                color: "#FF4500",
                letterSpacing: "0.05em",
              }}
            >
              密钥无效
            </p>
          )}
        </div>

        {/* 确认按钮（辅助，主要靠 Enter） */}
        <button
          onClick={handleSubmit}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
            cursor: "pointer",
            letterSpacing: "0.08em",
            padding: "4px 0",
            fontFamily: "inherit",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A1A")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
        >
          连接 →
        </button>
      </div>
    </div>
  );
}

// ========================================
// AccessGuard 主组件
// ========================================

interface AccessGuardProps {
  requiredRole: "ripple" | "giants";
  children: React.ReactNode;
}

function AccessGuardInner({ requiredRole, children }: AccessGuardProps) {
  const { role, isLoading } = useAccessControl();
  const [unlocked, setUnlocked] = useState(false);
  const [localRole, setLocalRole] = useState<Role>(null);

  // 同步 hook 返回的 role
  useEffect(() => {
    setLocalRole(role);
  }, [role]);

  const effectiveRole = localRole;
  const canAccess = unlocked || (!isLoading && hasAccess(effectiveRole, requiredRole));

  if (isLoading) {
    // 加载中：透明占位，避免闪烁
    return <div style={{ minHeight: "100vh" }} />;
  }

  return (
    <>
      {/* 内容层：始终渲染，锁定时被遮罩覆盖 */}
      <div
        style={{
          opacity: canAccess ? 1 : 0,
          transition: canAccess ? "opacity 0.5s ease 0.1s" : "none",
          pointerEvents: canAccess ? "auto" : "none",
        }}
      >
        {children}
      </div>

      {/* 锁定遮罩 */}
      {!canAccess && (
        <LockScreen
          onUnlock={() => {
            setUnlocked(true);
          }}
        />
      )}
    </>
  );
}

export function AccessGuard(props: AccessGuardProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <AccessGuardInner {...props} />
    </Suspense>
  );
}
