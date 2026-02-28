import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="text-stone-500 mb-4">页面未找到</p>
      <Link href="/" className="text-stone-600 underline underline-offset-2">
        返回首页
      </Link>
    </main>
  );
}
