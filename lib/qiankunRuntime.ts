"use client";

import type { MicroApp } from "qiankun";
import type { MiniAppConfig } from "./appRegistry";
import { createMiniAppLaunchProps } from "./launchContext";
import type { ShellBridge } from "./shellBridge";
import type { ShellUser } from "./shellUser";

export type MiniAppRuntimeState =
  | "idle"
  | "loading"
  | "mounted"
  | "standalone"
  | "error";

export type MiniAppRuntimeEvents = {
  onStateChange?: (state: MiniAppRuntimeState) => void;
  onError?: (error: unknown) => void;
};

let errorHandlerRegistered = false;

export async function ensureQiankunErrorHandler(
  onError?: (error: unknown) => void
) {
  if (errorHandlerRegistered) {
    return;
  }

  const { addGlobalUncaughtErrorHandler } = await import("qiankun");

  addGlobalUncaughtErrorHandler((event) => {
    console.error("[qiankun] mini app runtime error", event);
    onError?.(event);
  });
  errorHandlerRegistered = true;
}

export async function mountMiniApp(
  app: MiniAppConfig,
  user: ShellUser | null,
  token: string | undefined,
  shellBridge: ShellBridge,
  events: MiniAppRuntimeEvents = {}
): Promise<MicroApp> {
  const { loadMicroApp } = await import("qiankun");
  const launchProps = createMiniAppLaunchProps(app, user, token, shellBridge);

  events.onStateChange?.("loading");
  console.info("[qiankun] loading mini app", {
    appCode: app.appCode,
    entry: app.entry,
    correlationId: launchProps.correlationId
  });

  return loadMicroApp(
    {
      name: app.appCode,
      entry: app.entry,
      container: app.container,
      props: launchProps
    },
    {
      sandbox: {
        experimentalStyleIsolation: true
      },
      singular: true
    },
    {
      beforeLoad: [
        async () => {
          events.onStateChange?.("loading");
          console.info("[qiankun] beforeLoad", app.appCode);
        }
      ],
      beforeMount: [
        async () => {
          console.info("[qiankun] beforeMount", app.appCode);
        }
      ],
      afterMount: [
        async () => {
          events.onStateChange?.("mounted");
          console.info("[qiankun] mounted", app.appCode);
        }
      ],
      beforeUnmount: [
        async () => {
          console.info("[qiankun] beforeUnmount", app.appCode);
        }
      ],
      afterUnmount: [
        async () => {
          events.onStateChange?.("idle");
          console.info("[qiankun] unmounted", app.appCode);
        }
      ]
    }
  );
}
