import type { MiniAppConfig } from "./appRegistry";
import type { ShellBridge } from "./shellBridge";
import type { ShellUser } from "./shellUser";

export type MiniAppLaunchProps = {
  appCode: string;
  userContext: {
    userId: string;
    orgId: string;
    roles: string[];
  };
  token: string;
  correlationId: string;
  returnUrl: string;
  layoutContext: {
    navigationOwner: "shell";
    sidebarMode: "host-rendered";
  };
  shellBridge?: ShellBridge;
};

function createCorrelationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMiniAppLaunchProps(
  app: MiniAppConfig,
  user?: ShellUser | null,
  token?: string,
  shellBridge?: ShellBridge
): MiniAppLaunchProps {
  return {
    appCode: app.appCode,
    userContext: {
      userId: user?.userId ?? "anonymous-user",
      orgId: user?.orgId ?? "unknown-org",
      roles: user?.roles ?? []
    },
    token: token ?? "auth0-sso-context",
    correlationId: createCorrelationId(),
    returnUrl: "/",
    layoutContext: {
      navigationOwner: "shell",
      sidebarMode: "host-rendered"
    },
    shellBridge
  };
}
