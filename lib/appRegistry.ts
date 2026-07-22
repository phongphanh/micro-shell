import type { MiniAppNavItem } from "./shellBridge";

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
  },
  {
    appCode: "elog",
    name: "eLog",
    entry: {
      html: '<div id="elog-qiankun-entry"></div>',
      scripts: ["https://micro-elog.pages.dev/qiankun-lifecycle.js"],
      styles: ["https://micro-elog.pages.dev/_next/static/chunks/0ubm~s3l4o154.css"]
    },
    assetBaseUrl: "https://micro-elog.pages.dev",
    disableSandbox: true,
    activeRule: "/apps/elog",
    container: "#subapp-container",
    status: "ACTIVE",
    authMode: "SSO_CONTEXT",
    navItems: [
      {
        key: "elog-dashboard",
        label: "Dashboard",
        path: "/apps/elog",
        icon: "D"
      },
      {
        key: "elog-bookings",
        label: "Bookings",
        path: "/apps/elog/bookings",
        icon: "B"
      },
      {
        key: "elog-shipments",
        label: "Shipments",
        path: "/apps/elog/shipments",
        icon: "S"
      },
      {
        key: "elog-containers",
        label: "Containers",
        path: "/apps/elog/containers",
        icon: "C"
      },
      {
        key: "elog-appointments",
        label: "Truck Appointments",
        path: "/apps/elog/appointments",
        icon: "T"
      },
      {
        key: "elog-vehicles",
        label: "Vehicles",
        path: "/apps/elog/vehicles",
        icon: "V"
      },
      {
        key: "elog-drivers",
        label: "Drivers",
        path: "/apps/elog/drivers",
        icon: "D"
      },
      {
        key: "elog-documents",
        label: "Documents",
        path: "/apps/elog/documents",
        icon: "D"
      },
      {
        key: "elog-invoices",
        label: "Invoices",
        path: "/apps/elog/invoices",
        icon: "I"
      },
      {
        key: "elog-payments",
        label: "Payments",
        path: "/apps/elog/payments",
        icon: "P"
      },
      {
        key: "elog-customers",
        label: "Customers",
        path: "/apps/elog/customers",
        icon: "C"
      },
      {
        key: "elog-partners",
        label: "Partners",
        path: "/apps/elog/partners",
        icon: "P"
      },
      {
        key: "elog-reports",
        label: "Reports",
        path: "/apps/elog/reports",
        icon: "R"
      },
      {
        key: "elog-notifications",
        label: "Notifications",
        path: "/apps/elog/notifications",
        icon: "N"
      },
      {
        key: "elog-users",
        label: "Users",
        path: "/apps/elog/users",
        icon: "U"
      },
      {
        key: "elog-roles",
        label: "Roles",
        path: "/apps/elog/roles",
        icon: "R"
      },
      {
        key: "elog-master-data",
        label: "Master Data",
        path: "/apps/elog/master-data",
        icon: "M"
      },
      {
        key: "elog-settings",
        label: "Settings",
        path: "/apps/elog/settings",
        icon: "S"
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
