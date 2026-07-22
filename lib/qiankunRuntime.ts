"use client";

import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as ReactJSXRuntime from "react/jsx-runtime";
import type { MicroApp } from "qiankun";
import type { MiniAppConfig } from "./appRegistry";
import { createMiniAppLaunchProps } from "./launchContext";
import type { ShellBridge } from "./shellBridge";
import type { ShellUser } from "./shellUser";

export type MiniAppRuntimeState =
  | "idle"
  | "loading"
  | "mounted"
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

  exposeSharedReactGlobals();
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
      sandbox: app.disableSandbox
        ? false
        : {
            experimentalStyleIsolation: true
          },
      singular: true,
      fetch: createQiankunFetch()
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

function createQiankunFetch(): typeof window.fetch {
  return async (input, init) => {
    const response = await window.fetch(input, init);
    const contentType = response.headers.get("content-type") ?? "";
    const shouldNormalizeTextResponse =
      contentType.includes("text/html") ||
      contentType.includes("text/css") ||
      contentType.includes("javascript");

    if (!shouldNormalizeTextResponse) {
      return response;
    }

    // Next/Turbopack Pages deployments can expose streamed HTML/script
    // responses. import-html-entry expects to consume them as plain text while
    // evaluating the micro app, so normalize the stream into a fresh Response.
    const body = await response.text();

    return new Response(body, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };
}

function exposeSharedReactGlobals() {
  const sharedGlobal = window as typeof window & {
    React?: typeof React;
    ReactDOMClient?: typeof ReactDOMClient;
    ReactJSXRuntime?: typeof ReactJSXRuntime;
  };

  sharedGlobal.React ??= React;
  sharedGlobal.ReactDOMClient ??= ReactDOMClient;
  sharedGlobal.ReactJSXRuntime ??= ReactJSXRuntime;
}
