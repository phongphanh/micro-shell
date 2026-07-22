"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, type ReactNode, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AuthActions } from "@/components/AuthActions";
import {
  ShellNavigationProvider,
  useShellNavigation,
} from "@/components/ShellNavigationContext";
import { matchMiniAppByPath } from "@/lib/appRegistry";
import type { MiniAppNavItem } from "@/lib/shellBridge";

const shellMenuItems: MiniAppNavItem[] = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/apps/todo", label: "Todo Manager", icon: "T" },
  { href: "/apps/elog", label: "eLog", icon: "E" },
].map((item) => ({
  key: item.href,
  label: item.label,
  path: item.href,
  icon: item.icon,
}));

export function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <ShellNavigationProvider>
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </ShellNavigationProvider>
  );
}

function ShellLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeMiniApp = matchMiniAppByPath(pathname);
  const activeMiniAppCode = activeMiniApp?.appCode;
  const { getNavItems } = useShellNavigation();
  const [sidebarScope, setSidebarScope] = useState<"shell" | "mini">("shell");
  const shouldShowMiniNav = Boolean(activeMiniApp && sidebarScope === "mini");
  const navItems =
    shouldShowMiniNav && activeMiniApp
      ? (getNavItems(activeMiniApp.appCode) ?? activeMiniApp.navItems ?? [])
      : shellMenuItems;
  const sidebarLabel =
    shouldShowMiniNav && activeMiniApp
      ? `${activeMiniApp.name} navigation`
      : "Shell navigation";

  useEffect(() => {
    setSidebarScope(activeMiniAppCode ? "mini" : "shell");
  }, [activeMiniAppCode]);

  function handleShellNavClick(
    event: MouseEvent<HTMLAnchorElement>,
    item: MiniAppNavItem,
  ) {
    if (activeMiniApp && item.path === activeMiniApp.activeRule) {
      event.preventDefault();
      setSidebarScope("mini");
    }
  }

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
        <aside className="shell-sidebar" aria-label={sidebarLabel}>
          {shouldShowMiniNav && activeMiniApp ? (
            <div className="shell-sidebar-context">
              <button
                aria-label="Show shell navigation"
                className="sidebar-back-button"
                onClick={() => setSidebarScope("shell")}
                type="button"
              >
                <span aria-hidden="true" className="flex w-7 h-7">&lt;</span>
                <span className="flex">{activeMiniApp.name}</span>
              </button>
            </div>
          ) : null}

          <nav className="shell-menu">
            {navItems.map((item) => {
              const isActive = isActiveNavItem(
                item,
                pathname,
                shouldShowMiniNav,
                activeMiniApp?.activeRule,
              );

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`shell-link${isActive ? " shell-link-active" : ""}`}
                  href={item.path}
                  key={item.key}
                  onClick={
                    shouldShowMiniNav
                      ? undefined
                      : (event) => handleShellNavClick(event, item)
                  }
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

function isActiveNavItem(
  item: MiniAppNavItem,
  pathname: string,
  isMiniNav: boolean,
  miniAppRoot?: string,
) {
  const shouldMatchExactly =
    item.path === "/" || (isMiniNav && item.path === miniAppRoot);

  return shouldMatchExactly
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(`${item.path}/`);
}
