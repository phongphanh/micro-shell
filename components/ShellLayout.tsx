"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Car,
  ClipboardList,
  Container,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  PackageCheck,
  PanelLeft,
  ReceiptText,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AuthActions } from "@/components/AuthActions";
import {
  ShellNavigationProvider,
  useShellNavigation,
} from "@/components/ShellNavigationContext";
import { matchMiniAppByPath } from "@/lib/appRegistry";
import { cn } from "@/lib/utils";
import type { MiniAppNavItem } from "@/lib/shellBridge";
import styles from "./ShellLayout.module.css";

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

const navIconMap: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/apps/todo": ListChecks,
  "/apps/elog": Boxes,
  "todo-dashboard": Gauge,
  "todo-tasks": ClipboardList,
  "todo-weather": Home,
  "elog-dashboard": Gauge,
  "elog-bookings": BriefcaseBusiness,
  "elog-shipments": PackageCheck,
  "elog-containers": Container,
  "elog-appointments": CalendarClock,
  "elog-vehicles": Car,
  "elog-drivers": Users,
  "elog-documents": FileText,
  "elog-invoices": ReceiptText,
  "elog-payments": WalletCards,
  "elog-customers": Building2,
  "elog-partners": BriefcaseBusiness,
  "elog-reports": ClipboardList,
  "elog-notifications": Bell,
  "elog-users": UserCog,
  "elog-roles": ShieldCheck,
  "elog-master-data": PackageCheck,
  "elog-settings": Settings,
};

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const shouldShowMiniNav = Boolean(activeMiniApp && sidebarScope === "mini");
  const miniAppPublishedNavItems = activeMiniApp
    ? getNavItems(activeMiniApp.appCode)
    : undefined;
  const miniAppNavItems =
    miniAppPublishedNavItems?.length
      ? miniAppPublishedNavItems
      : (activeMiniApp?.navItems ?? []);
  const navItems =
    shouldShowMiniNav && activeMiniApp ? miniAppNavItems : shellMenuItems;
  const sidebarLabel =
    shouldShowMiniNav && activeMiniApp
      ? `${activeMiniApp.name} navigation`
      : "Shell navigation";

  useEffect(() => {
    setSidebarScope(activeMiniAppCode ? "mini" : "shell");
    if (activeMiniAppCode) {
      setIsSidebarOpen(true);
    }
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
    <div
      className={cn(
        styles.shellRoot,
        !isSidebarOpen && styles.shellRootCollapsed,
      )}
    >
      <aside
        aria-label={sidebarLabel}
        className={cn(styles.sidebar, !isSidebarOpen && styles.collapsed)}
      >
        <div className={styles.sidebarHeader}>
          <Link className={styles.brandLink} href="/" title="Super Web Shell">
            <span className={styles.brandMark}>SW</span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>Super Web Shell</span>
              <span className={styles.brandSubtitle}>Qiankun host</span>
            </span>
          </Link>
        </div>

        <div className={styles.separator} />

        <nav className={styles.sidebarContent}>
          <div className={styles.groupLabel}>
            {shouldShowMiniNav && activeMiniApp
              ? activeMiniApp.name
              : "Workspace"}
          </div>
          <ul className={styles.navList}>
            {shouldShowMiniNav && activeMiniApp ? (
              <li>
                <button
                  className={styles.navButton}
                  onClick={() => setSidebarScope("shell")}
                  title="Shell navigation"
                  type="button"
                >
                  <span className={styles.navIcon}>
                    <ArrowLeft />
                  </span>
                  <span className={styles.navText}>Shell navigation</span>
                </button>
              </li>
            ) : null}

            {navItems.map((item) => {
              const Icon = navIconMap[item.key] ?? iconForLabel(item.label);
              const isActive = isActiveNavItem(
                item,
                pathname,
                shouldShowMiniNav,
                activeMiniApp?.activeRule,
              );

              return (
                <li key={item.key}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(styles.navLink, isActive && styles.navActive)}
                    href={item.path}
                    onClick={
                      shouldShowMiniNav
                        ? undefined
                        : (event) => handleShellNavClick(event, item)
                    }
                    title={item.label}
                  >
                    <span className={styles.navIcon}>
                      <Icon />
                    </span>
                    <span className={styles.navText}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.header}>
          <button
            aria-label="Toggle sidebar"
            className={styles.trigger}
            onClick={() => setIsSidebarOpen((open) => !open)}
            title="Toggle sidebar"
            type="button"
          >
            <span className={styles.headerIcon}>
              <PanelLeft />
            </span>
          </button>
          <span className={styles.headerSeparator} />
          <div className={styles.headerTitle}>
            <strong>{activeMiniApp?.name ?? "Dashboard"}</strong>
            <span>
              {activeMiniApp ? "Mini app runtime boundary" : "Shell operations"}
            </span>
          </div>
          <AuthActions />
        </header>

        <main className={styles.main}>
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}

function iconForLabel(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("setting")) return Settings;
  if (normalized.includes("user") || normalized.includes("driver")) return Users;
  if (normalized.includes("invoice")) return ReceiptText;
  if (normalized.includes("payment")) return BadgeDollarSign;
  if (normalized.includes("report")) return ClipboardList;
  if (normalized.includes("document")) return FileText;
  if (normalized.includes("vehicle")) return Truck;

  return Boxes;
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
