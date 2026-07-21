"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import type { MiniAppNavItem, ShellBridge } from "@/lib/shellBridge";

type ShellNavigationContextValue = {
  getNavItems: (appCode: string) => MiniAppNavItem[] | undefined;
  shellBridge: ShellBridge;
};

const ShellNavigationContext =
  createContext<ShellNavigationContextValue | null>(null);

export function ShellNavigationProvider({
  children
}: {
  children: ReactNode;
}) {
  const [miniAppNavItems, setMiniAppNavItems] = useState<
    Record<string, MiniAppNavItem[]>
  >({});

  const setNavItems = useCallback(
    (appCode: string, navItems: MiniAppNavItem[]) => {
      setMiniAppNavItems((current) => {
        if (areNavItemsEqual(current[appCode], navItems)) {
          return current;
        }

        return {
          ...current,
          [appCode]: navItems
        };
      });
    },
    []
  );

  const clearNavItems = useCallback((_appCode: string) => {
    // Keep published navs cached so switching the sidebar back to the current
    // mini app does not require a route change or a mini app remount.
  }, []);

  const getNavItems = useCallback(
    (appCode: string) => miniAppNavItems[appCode],
    [miniAppNavItems]
  );

  const shellBridge = useMemo(
    () => ({
      setNavItems,
      clearNavItems
    }),
    [clearNavItems, setNavItems]
  );

  const value = useMemo<ShellNavigationContextValue>(
    () => ({
      getNavItems,
      shellBridge
    }),
    [getNavItems, shellBridge]
  );

  return (
    <ShellNavigationContext.Provider value={value}>
      {children}
    </ShellNavigationContext.Provider>
  );
}

function areNavItemsEqual(
  current: MiniAppNavItem[] | undefined,
  next: MiniAppNavItem[]
) {
  if (!current || current.length !== next.length) {
    return false;
  }

  return current.every((item, index) => {
    const nextItem = next[index];

    return (
      item.key === nextItem.key &&
      item.label === nextItem.label &&
      item.path === nextItem.path &&
      item.icon === nextItem.icon
    );
  });
}

export function useShellNavigation() {
  const value = useContext(ShellNavigationContext);

  if (!value) {
    throw new Error(
      "useShellNavigation must be used within ShellNavigationProvider."
    );
  }

  return value;
}
