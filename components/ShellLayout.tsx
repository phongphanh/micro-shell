"use client";

import { usePathname, useRouter } from "next/navigation";
import {
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
  const router = useRouter();
  const activeMiniApp = matchMiniAppByPath(pathname);
  const activeMiniAppCode = activeMiniApp?.appCode;
  const { getNavItems, unmountMiniApp } = useShellNavigation();
  const [sidebarScope, setSidebarScope] = useState<"shell" | "mini">("shell");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const shouldShowMiniNav = Boolean(activeMiniApp && sidebarScope === "mini");
  const miniAppPublishedNavItems = activeMiniApp
    ? getNavItems(activeMiniApp.appCode)
    : undefined;

  const miniAppNavItems = activeMiniApp
    ? (miniAppPublishedNavItems ?? []).map((item) =>
        normalizeMiniAppNavItem(item, activeMiniApp.activeRule),
      )
    : [];
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

  function handleShellNavClick(item: MiniAppNavItem) {
    if (activeMiniApp && item.path === activeMiniApp.activeRule) {
      setSidebarScope("mini");
      return;
    }

    void navigateToNavItem(item.path);
  }

  async function navigateToNavItem(path: string) {
    if (path === pathname) {
      return;
    }

    if (path.startsWith("#") && typeof window !== "undefined") {
      window.location.hash = path;
      return;
    }

    if (/^[a-z][a-z\d+.-]*:/i.test(path) && typeof window !== "undefined") {
      window.location.assign(path);
      return;
    }

    const targetMiniApp = matchMiniAppByPath(path);
    const shouldUnmountActiveMiniApp =
      activeMiniApp &&
      (!targetMiniApp || targetMiniApp.appCode !== activeMiniApp.appCode);

    if (shouldUnmountActiveMiniApp) {
      try {
        await unmountMiniApp(activeMiniApp.appCode);
      } catch (error) {
        console.error(
          "[shell] failed to unmount mini app before navigation",
          error,
        );
      }
    }

    router.push(path);
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
          <button
            className={styles.brandLink}
            onClick={() => void navigateToNavItem("/")}
            title="Super Web Shell"
            type="button"
          >
            <span className={styles.brandMark}>SW</span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>Super Web Shell</span>
              <span className={styles.brandSubtitle}>Qiankun host</span>
            </span>
          </button>
        </div>

        <div className={styles.separator} />

        <nav className={styles.sidebarContent}>
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
                  <button
                    aria-current={isActive ? "page" : undefined}
                    className={cn(styles.navLink, isActive && styles.navActive)}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      shouldShowMiniNav
                        ? void navigateToNavItem(item.path)
                        : handleShellNavClick(item);
                    }}
                    title={item.label}
                    type="button"
                  >
                    <span className={styles.navIcon}>
                      <Icon />
                    </span>
                    <span className={styles.navText}>{item.label}</span>
                  </button>
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

function normalizeMiniAppNavItem(
  item: MiniAppNavItem,
  miniAppRoot: string,
): MiniAppNavItem {
  return {
    ...item,
    path: normalizeMiniAppPath(item.path, miniAppRoot),
  };
}

function normalizeMiniAppPath(path: string, miniAppRoot: string) {
  const trimmedPath = path.trim();

  if (
    trimmedPath.startsWith("/") ||
    trimmedPath.startsWith("#") ||
    /^[a-z][a-z\d+.-]*:/i.test(trimmedPath)
  ) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith("apps/")) {
    return `/${trimmedPath}`;
  }

  const normalizedRoot = miniAppRoot.endsWith("/")
    ? miniAppRoot.slice(0, -1)
    : miniAppRoot;

  return `${normalizedRoot}/${trimmedPath}`;
}
