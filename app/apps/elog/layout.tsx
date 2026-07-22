import { type ReactNode } from "react";
import { MiniAppViewport } from "@/components/MiniAppViewport";

export default function ElogAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MiniAppViewport appCode="elog" />
      {children}
    </>
  );
}
