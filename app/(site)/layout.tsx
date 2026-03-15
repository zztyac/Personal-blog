import type { ReactNode } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/archive", label: "文章档案" },
  { href: "/about", label: "关于" }
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href="/" className="brand-lockup" aria-label="Neon District">
            <span className="brand-lockup__eyebrow">Cyber Logs</span>
            <span className="brand-lockup__name">Neon District</span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="shell">
          <div className="eyebrow-row">
            <span>NEON DISTRICT / PERSONAL TECH LOG</span>
            <span>Markdown import + topic routing + online editing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
