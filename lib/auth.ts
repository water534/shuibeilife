import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// ========================================
// 权限密钥定义
// ========================================

export const KEY_RIPPLE = "RIPPLE_MASTER";  // 解锁全站
export const KEY_GIANTS = "GIANTS_2026";    // 仅解锁 /giants

const STORAGE_KEY = "user_secret";

export type Role = "ripple" | "giants" | null;

function keyToRole(key: string): Role {
  if (key === KEY_RIPPLE) return "ripple";
  if (key === KEY_GIANTS) return "giants";
  return null;
}

/** 判断 role 是否满足所需权限 */
export function hasAccess(role: Role, required: "ripple" | "giants"): boolean {
  if (role === "ripple") return true; // ripple 解锁全站
  if (role === "giants" && required === "giants") return true;
  return false;
}

// ========================================
// useAccessControl Hook
// ========================================

export function useAccessControl(): { role: Role; isLoading: boolean } {
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. 先尝试从 URL ?key= 读取
    const urlKey = searchParams.get("key");
    if (urlKey) {
      const urlRole = keyToRole(urlKey);
      if (urlRole) {
        localStorage.setItem(STORAGE_KEY, urlKey);
        setRole(urlRole);
        setIsLoading(false);
        return;
      }
    }

    // 2. 从 localStorage 读取
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRole(keyToRole(stored));
    }

    setIsLoading(false);
  }, [searchParams]);

  return { role, isLoading };
}

/** 手动设置密钥（供 AccessGuard 输入框使用），返回是否成功 */
export function applyKey(input: string): Role {
  const role = keyToRole(input.trim());
  if (role) {
    localStorage.setItem(STORAGE_KEY, input.trim());
  }
  return role;
}
