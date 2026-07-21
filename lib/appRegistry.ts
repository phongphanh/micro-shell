import type { MiniAppNavItem } from "./shellBridge";

export type MiniAppStatus = "ACTIVE" | "INACTIVE";

export type MiniAppConfig = {
  appCode: string;
  name: string;
  entry: string;
  activeRule: string;
  container: string;
  status: MiniAppStatus;
  authMode: "SSO_CONTEXT";
  standaloneFallback?: boolean;
  navItems?: MiniAppNavItem[];
};

// Mirrors a CMS-driven registry shape so the source can later be replaced by
// an API call without changing Qiankun's bootstrap surface.
export const appRegistry: MiniAppConfig[] = [
  {
    appCode: "todo",
    name: "Todo Manager",
    entry: "https://micro-todo-app.pages.dev/",
    activeRule: "/apps/todo",
    container: "#subapp-container",
    status: "ACTIVE",
    authMode: "SSO_CONTEXT",
    navItems: [
      {
        key: "todo-dashboard",
        label: "Dashboard",
        path: "/apps/todo",
        icon: "D"
      },
      {
        key: "todo-tasks",
        label: "Tasks",
        path: "/apps/todo/tasks",
        icon: "T"
      },
      {
        key: "todo-weather",
        label: "Weather",
        path: "/apps/todo/weather",
        icon: "W"
      }
    ]
  }
];

export function getActiveMiniApps() {
  return appRegistry.filter((app) => app.status === "ACTIVE");
}

export function getMiniAppByCode(appCode: string) {
  return getActiveMiniApps().find((app) => app.appCode === appCode);
}

export function matchMiniAppByPath(pathname: string) {
  return getActiveMiniApps().find((app) =>
    pathname === app.activeRule || pathname.startsWith(`${app.activeRule}/`)
  );
}
