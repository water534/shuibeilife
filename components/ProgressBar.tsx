"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

// 禁用 NProgress 自带 spinner，只保留顶部进度条
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

export function ProgressBar() {
  const pathname = usePathname();
  const prevPathname = useRef<string>(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // 路由已完成跳转，结束进度条
      NProgress.done();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    // 监听 Next.js 路由开始（通过 click 事件在 <a> 上触发）
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      // 内部路由跳转，启动进度条
      NProgress.start();
      // 保底：5 秒后强制结束，防止卡住
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 5000);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
