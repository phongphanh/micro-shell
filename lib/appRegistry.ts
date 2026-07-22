export type MiniAppStatus = "ACTIVE" | "INACTIVE";
export type MiniAppEntry =
  | string
  | {
      html?: string;
      scripts?: string[];
      styles?: string[];
    };

export type MiniAppConfig = {
  id?: number;
  appCode: string;
  name: string;
  entry: MiniAppEntry;
  activeRule: string;
  container: string;
  status: MiniAppStatus;
  authMode: "SSO_CONTEXT";
  permissions?: string[];
  assetBaseUrl?: string;
  disableSandbox?: boolean;
};

export type AppRegistryResponse = {
  success: boolean;
  data: MiniAppConfig[];
};

export type UserPermissionsProfile = {
  name: string;
  permissions: string[];
};

export type UserPermissionsResponse = {
  success: boolean;
  data: UserPermissionsProfile;
};

export const APP_REGISTRY_API =
  "https://my-json-server.typicode.com/phongphanh/micro-db/app-registry";

const USER_PERMISSIONS_API_BASE =
  "https://my-json-server.typicode.com/phongphanh/micro-db";

export async function fetchAppRegistry(signal?: AbortSignal) {
  const response = await fetch(APP_REGISTRY_API, { signal });

  if (!response.ok) {
    throw new Error(`App registry request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as AppRegistryResponse;

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error("App registry response is invalid.");
  }

  return payload.data;
}

export async function fetchUserPermissions(
  username: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${USER_PERMISSIONS_API_BASE}/${encodeURIComponent(username)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`User permissions request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as UserPermissionsResponse;

  if (
    !payload.success ||
    !payload.data ||
    !Array.isArray(payload.data.permissions)
  ) {
    throw new Error("User permissions response is invalid.");
  }

  return payload.data;
}

export function getUsernameFromEmail(email?: string) {
  return email?.split("@")[0]?.trim() || undefined;
}

export function getActiveMiniApps(appRegistry: MiniAppConfig[]) {
  return appRegistry.filter((app) => app.status === "ACTIVE");
}

export function filterMiniAppsByPermissions(
  appRegistry: MiniAppConfig[],
  userPermissions: string[],
) {
  const permissionSet = new Set(userPermissions);

  return getActiveMiniApps(appRegistry).filter((app) => {
    if (!app.permissions?.length) {
      return true;
    }

    return app.permissions.some((permission) => permissionSet.has(permission));
  });
}

export function getMiniAppByCode(
  appRegistry: MiniAppConfig[],
  appCode: string,
) {
  return getActiveMiniApps(appRegistry).find((app) => app.appCode === appCode);
}

export function matchMiniAppByPath(
  appRegistry: MiniAppConfig[],
  pathname: string,
) {
  return getActiveMiniApps(appRegistry).find(
    (app) =>
      pathname === app.activeRule || pathname.startsWith(`${app.activeRule}/`),
  );
}
