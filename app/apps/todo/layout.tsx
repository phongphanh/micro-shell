import { type ReactNode } from "react";
import { MiniAppViewport } from "@/components/MiniAppViewport";

export default function TodoAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MiniAppViewport appCode="todo" />
      {children}
    </>
  );
}
