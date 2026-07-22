export type MiniAppStatus = "ACTIVE" | "INACTIVE";
export type MiniAppEntry =
  | string
  | {
      html?: string;
      scripts?: string[];
      styles?: string[];
    };

export type MiniAppConfig = {
  appCode: string;
  name: string;
  entry: MiniAppEntry;
  activeRule: string;
  container: string;
  status: MiniAppStatus;
  authMode: "SSO_CONTEXT";
  assetBaseUrl?: string;
  disableSandbox?: boolean;
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
  },
  {
    appCode: "elog",
    name: "eLog",
    entry: {
      html: '<div id="elog-qiankun-entry"></div>',
      scripts: ["https://micro-elog.pages.dev/qiankun-lifecycle.js"],
      styles: [
        "https://micro-elog.pages.dev/_next/static/chunks/0ubm~s3l4o154.css",
      ],
    },
    assetBaseUrl: "https://micro-elog.pages.dev",
    disableSandbox: false,
    activeRule: "/apps/elog",
    container: "#subapp-container",
    status: "ACTIVE",
    authMode: "SSO_CONTEXT",
  },
];

export function getActiveMiniApps() {
  return appRegistry.filter((app) => app.status === "ACTIVE");
}

export function getMiniAppByCode(appCode: string) {
  return getActiveMiniApps().find((app) => app.appCode === appCode);
}

export function matchMiniAppByPath(pathname: string) {
  return getActiveMiniApps().find(
    (app) =>
      pathname === app.activeRule || pathname.startsWith(`${app.activeRule}/`),
  );
}
