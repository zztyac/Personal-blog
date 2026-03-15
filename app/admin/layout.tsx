import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth/admin";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/topics", label: "专题" },
  { href: "/admin/posts/new", label: "新建文章" }
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand-lockup" aria-label="Admin dashboard">
          <span className="brand-lockup__eyebrow">Control Layer</span>
          <span className="brand-lockup__name">Admin Grid</span>
        </Link>
        <nav aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} style={{ marginTop: 24 }}>
          <button type="submit" className="button-secondary" style={{ width: "100%" }}>
            退出登录
          </button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
