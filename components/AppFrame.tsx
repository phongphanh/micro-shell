"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ShellLayout } from "@/components/ShellLayout";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return <ShellLayout>{children}</ShellLayout>;
}
