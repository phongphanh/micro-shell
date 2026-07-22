"use client";

import { useAuth0 } from "@auth0/auth0-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchAppRegistry,
  fetchUserPermissions,
  filterMiniAppsByPermissions,
  getMiniAppByCode,
  getUsernameFromEmail,
  matchMiniAppByPath,
  type MiniAppConfig,
  type UserPermissionsProfile,
} from "@/lib/appRegistry";

type AppRegistryContextValue = {
  allMiniApps: MiniAppConfig[];
  error: string | null;
  getMiniAppByCode: (appCode: string) => MiniAppConfig | undefined;
  isLoading: boolean;
  matchMiniAppByPath: (pathname: string) => MiniAppConfig | undefined;
  miniApps: MiniAppConfig[];
  userPermissions: string[];
  userProfile: UserPermissionsProfile | null;
};

const AppRegistryContext = createContext<AppRegistryContextValue | null>(null);

export function AppRegistryProvider({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user: auth0User,
  } = useAuth0();
  const [allMiniApps, setAllMiniApps] = useState<MiniAppConfig[]>([]);
  const [userProfile, setUserProfile] =
    useState<UserPermissionsProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setAllMiniApps([]);
      setUserProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const username = getUsernameFromEmail(auth0User?.email);

    if (!username) {
      setAllMiniApps([]);
      setUserProfile(null);
      setError("Cannot load mini apps because the signed-in user has no email.");
      setIsLoading(false);
      return;
    }

    const requestedUsername = username;
    const abortController = new AbortController();

    setIsLoading(true);
    setError(null);

    async function loadRegistry() {
      try {
        const [registry, profile] = await Promise.all([
          fetchAppRegistry(abortController.signal),
          fetchUserPermissions(requestedUsername, abortController.signal),
        ]);

        setAllMiniApps(registry);
        setUserProfile(profile);
      } catch (loadError) {
        if (abortController.signal.aborted) {
          return;
        }

        setAllMiniApps([]);
        setUserProfile(null);
        setError(formatRegistryError(loadError));
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadRegistry();

    return () => {
      abortController.abort();
    };
  }, [auth0User?.email, isAuthLoading, isAuthenticated]);

  const userPermissions = useMemo(
    () => userProfile?.permissions ?? [],
    [userProfile?.permissions],
  );
  const miniApps = useMemo(
    () => filterMiniAppsByPermissions(allMiniApps, userPermissions),
    [allMiniApps, userPermissions],
  );
  const value = useMemo<AppRegistryContextValue>(
    () => ({
      allMiniApps,
      error,
      getMiniAppByCode: (appCode) => getMiniAppByCode(miniApps, appCode),
      isLoading: isAuthLoading || isLoading,
      matchMiniAppByPath: (pathname) => matchMiniAppByPath(miniApps, pathname),
      miniApps,
      userPermissions,
      userProfile,
    }),
    [
      allMiniApps,
      error,
      isAuthLoading,
      isLoading,
      miniApps,
      userPermissions,
      userProfile,
    ],
  );

  return (
    <AppRegistryContext.Provider value={value}>
      {children}
    </AppRegistryContext.Provider>
  );
}

export function useAppRegistry() {
  const value = useContext(AppRegistryContext);

  if (!value) {
    throw new Error("useAppRegistry must be used within AppRegistryProvider.");
  }

  return value;
}

function formatRegistryError(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load mini apps.";
}
