export type MiniAppNavItem = {
  key: string;
  label: string;
  path: string;
  icon?: string;
};

export type ShellBridge = {
  setNavItems: (appCode: string, navItems: MiniAppNavItem[]) => void;
  clearNavItems: (appCode: string) => void;
};
