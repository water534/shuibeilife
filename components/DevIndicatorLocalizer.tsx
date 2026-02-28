"use client";

import { useEffect } from "react";

const LABEL_MAP: [RegExp | string, string][] = [
  ["Route", "路由"],
  ["Rendering", "渲染"],
  ["Static", "静态"],
  ["Dynamic", "动态"],
  ["Build", "构建"],
  ["Compiling", "编译中"],
  ["Compiled in", "编译完成"],
  ["Errors", "错误"],
  ["Runtime", "运行"],
  ["Overview", "概览"],
  ["Issues", "问题"],
  ["Source", "源码"],
];

function replaceTextInNode(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    let content = node.textContent;
    for (const [en, zh] of LABEL_MAP) {
      const escaped = String(en).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      content = content.replace(new RegExp(escaped, "gi"), zh);
    }
    if (content !== node.textContent) node.textContent = content;
  } else if (node.nodeType === Node.ELEMENT_NODE && !["SCRIPT", "STYLE"].includes((node as Element).tagName)) {
    node.childNodes.forEach(replaceTextInNode);
  }
}

function localizeDevIndicator() {
  const selector = "[data-nextjs-toast], .nextjs-toast, .dev-tools-indicator-menu, .dev-tools-indicator-label, .dev-tools-indicator-value";
  document.querySelectorAll(selector).forEach((el) => replaceTextInNode(el));
}

export function DevIndicatorLocalizer() {
  useEffect(() => {
    const run = () => {
      localizeDevIndicator();
    };
    run();
    const t = setInterval(run, 1000);
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearInterval(t);
      observer.disconnect();
    };
  }, []);
  return null;
}
