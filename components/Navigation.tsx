"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ORANGE = "#FF4500";
const GRAY = "#86868B";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={active ? ORANGE : GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "rgba(255,69,0,0.08)" : "none"}
      />
    </svg>
  );
}

function GiantsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19V6C4 5.44772 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6V19"
        stroke={active ? ORANGE : GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 19H22"
        stroke={active ? ORANGE : GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 9H16M8 13H13"
        stroke={active ? ORANGE : GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGiants = pathname.startsWith("/post/");

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        height: "calc(56px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Link
        href="/"
        className="flex flex-col items-center gap-1 px-8 py-2 active:scale-95 transition-transform duration-100"
      >
        <HomeIcon active={isHome} />
        <span
          className="text-[10px] font-medium tracking-wide"
          style={{ color: isHome ? ORANGE : GRAY }}
        >
          主页
        </span>
      </Link>

      <Link
        href="/post/30a88738e1468148b789de669054972d?v=30a88738e1468187ab59000c6dc4c7d9"
        className="flex flex-col items-center gap-1 px-8 py-2 active:scale-95 transition-transform duration-100"
      >
        <GiantsIcon active={isGiants} />
        <span
          className="text-[10px] font-medium tracking-wide"
          style={{ color: isGiants ? ORANGE : GRAY }}
        >
          巨人的肩膀
        </span>
      </Link>
    </nav>
  );
}
