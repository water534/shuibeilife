"use client";

import { Suspense } from "react";
import Link from "next/link";
import { AccessGuard } from "@/components/AccessGuard";
import { navigation } from "@/src/config/site";

// 每个分类的补充描述
const CARD_META: Record<string, { guide: string; questions: readonly string[] }> = {
  direction: {
    guide: "当你需要确认方向，或提升自己的判断能力。",
    questions: [
      "我该往哪条路走，才更可能长期成立",
      "面对选择时，我怎样判断、怎样取舍",
    ],
  },
  content: {
    guide: "当你在创作上卡住，或想提升内容吸引力。",
    questions: [
      "写什么、怎么写，才更适合现在的我",
      "我如何稳定产出，而不是靠燃烧灵感",
    ],
  },
  system: {
    guide: "当你想把事情做下去：如何持续、省力、稳定。",
    questions: [
      "节奏为什么总是断、总是拖、总是卡",
      "我需要怎样的习惯与系统，才能长期持续",
    ],
  },
  business: {
    guide: "当你开始面对外界反馈：粉丝、增长、产品、变现。",
    questions: [
      "商业模式/产品制作/转化路径是否成立",
      "我应该如何制作产品/推广",
    ],
  },
};

function GiantsContent() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>

        {/* 头部区域 */}
        <header
          className="notion-content-fade-in"
          style={{ paddingTop: "15vh", paddingBottom: 0, textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 700,
              color: "#1A1A1A",
              letterSpacing: "0.2em",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            巨人的肩膀
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 20,
              color: "#86868B",
              letterSpacing: "0.05em",
              lineHeight: 1.8,
            }}
          >
            一人公司问题知识库
          </p>

          {/* 橙色退晕细线 */}
          <div
            style={{
              margin: "16px auto 0",
              width: 120,
              height: 1,
              background: "linear-gradient(to right, transparent, #FF4500, transparent)",
              opacity: 0.6,
            }}
          />

          {/* 品牌文案 */}
          <div
            style={{
              marginTop: 32,
              color: "#86868B",
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 560,
              margin: "32px auto 0",
            }}
          >
            <p style={{ margin: "0 0 8px" }}>水杯不装水丨一人公司长期主义实践者。</p>
            <p style={{ margin: "0 0 8px" }}>在探索一人公司的路上，我总是能遇到一些问题，</p>
            <p style={{ margin: "0 0 8px" }}>为了持续前进，我想要寻找巨人的经验，找到最优质的解决方案。</p>
            <p style={{ margin: "0 0 8px" }}>在一步步的行动中，我把内容汇总了起来。</p>
            <p style={{ margin: "16px 0 0" }}>愿它能找到你的困惑，解答你的迷茫，激发你的行动。</p>
            <p style={{ margin: "4px 0 0" }}>找回你的自由人生</p>
          </div>
        </header>

        {/* 2×2 模块矩阵 */}
        <section
          className="notion-content-fade-in"
          style={{ marginTop: 64, paddingBottom: 80 }}
        >
          <style>{`
            .giants-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
            }
            @media (max-width: 640px) {
              .giants-grid {
                grid-template-columns: 1fr;
                gap: 16px;
              }
            }
            .giants-card {
              border: 1px solid #e5e5e5;
              border-radius: 16px;
              padding: 28px;
              text-decoration: none;
              display: block;
              background: #fff;
              transition: border-color 0.25s ease, box-shadow 0.25s ease;
            }
            .giants-card:hover {
              border-color: #FF4500;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
          `}</style>
          <div className="giants-grid">
            {navigation.map((item) => {
              const meta = CARD_META[item.id];
              if (!meta) return null;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="giants-card"
                >
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#1A1A1A",
                      margin: 0,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.label}
                  </h2>
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: "#86868B",
                      lineHeight: 1.6,
                    }}
                  >
                    {meta.guide}
                  </p>
                  <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
                    {meta.questions.map((q) => (
                      <li
                        key={q}
                        style={{
                          fontSize: 13,
                          color: "#aaa",
                          lineHeight: 1.6,
                          display: "flex",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 页脚 */}
        <footer
          style={{
            paddingTop: 32,
            paddingBottom: 48,
            textAlign: "center",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "#86868B", lineHeight: 1.8 }}>
            水杯不装水
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#86868B", lineHeight: 1.8 }}>
            一人公司长期主义实践者
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function GiantsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}>
      <AccessGuard requiredRole="giants">
        <GiantsContent />
      </AccessGuard>
    </Suspense>
  );
}
