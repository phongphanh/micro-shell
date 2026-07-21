import type { MiniAppConfig } from "./appRegistry";

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
};

function createCorrelationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMiniAppLaunchProps(
  app: MiniAppConfig
): MiniAppLaunchProps {
  return {
    appCode: app.appCode,
    userContext: {
      userId: "demo-user",
      orgId: "demo-org",
      roles: ["admin"]
    },
    token: "demo-launch-token",
    correlationId: createCorrelationId(),
    returnUrl: "/"
  };
}
