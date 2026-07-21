"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AuthActions } from "@/components/AuthActions";

const menuItems = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/apps/todo", label: "Todo Manager", icon: "T" }
];

export function ShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-brand">
          <span className="shell-logo" aria-hidden="true">
            SW
          </span>
          <div className="shell-title">
            <strong>Super Web Shell</strong>
            <span>Qiankun micro frontend host</span>
          </div>
        </div>
        <AuthActions />
      </header>

      <div className="shell-body">
        <aside className="shell-sidebar" aria-label="Shell navigation">
          <nav className="shell-menu">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`shell-link${isActive ? " shell-link-active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="shell-link-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="shell-main">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}
