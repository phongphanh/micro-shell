"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, Loader2, MonitorCog } from "lucide-react";
import type { MicroApp } from "qiankun";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAppRegistry } from "@/components/AppRegistryProvider";
import {
  ensureQiankunErrorHandler,
  mountMiniApp,
  type MiniAppRuntimeState
} from "@/lib/qiankunRuntime";
import { toShellUser } from "@/lib/shellUser";
import { useShellNavigation } from "@/components/ShellNavigationContext";

export function MiniAppViewport({ appCode }: { appCode: string }) {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const { registerMiniAppUnmount, shellBridge } = useShellNavigation();
  const {
    error: appRegistryError,
    getMiniAppByCode,
    isLoading: isAppRegistryLoading
  } = useAppRegistry();
  const user = useMemo(() => toShellUser(auth0User), [auth0User]);
  const app = getMiniAppByCode(appCode);
  const microAppRef = useRef<MicroApp | null>(null);
  const mountRunIdRef = useRef(0);
  const [runtimeState, setRuntimeState] =
    useState<MiniAppRuntimeState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(
    () =>
      registerMiniAppUnmount(appCode, async () => {
        const microApp = microAppRef.current;

        if (!microApp) {
          return;
        }

        microAppRef.current = null;
        await microApp.unmount();
      }),
    [appCode, registerMiniAppUnmount]
  );

  useEffect(() => {
    const runId = mountRunIdRef.current + 1;
    mountRunIdRef.current = runId;
    let disposed = false;
    let mountedReconcileTimer: number | undefined;

    const isCurrentRun = () => !disposed && mountRunIdRef.current === runId;
    const setCurrentRuntimeState = (state: MiniAppRuntimeState) => {
      if (isCurrentRun()) {
        setRuntimeState(state);
      }
    };
    const handleRuntimeError = (error: unknown) => {
      if (!isCurrentRun()) {
        return;
      }

      const message = formatError(error);

      setRuntimeState("error");
      setErrorMessage(message);
    };

    if (isAppRegistryLoading) {
      setCurrentRuntimeState("loading");
      setErrorMessage(null);
      return;
    }

    if (!app) {
      handleRuntimeError(`Mini app "${appCode}" is not active or registered.`);
      return;
    }

    const registeredApp = app;
    setRuntimeState("loading");
    setErrorMessage(null);

    const handleUnhandledQiankunError = (event: ErrorEvent) => {
      if (
        isReadableStreamClosedError(event.error) ||
        isReadableStreamClosedError(event.message)
      ) {
        event.preventDefault();
        handleRuntimeError(event.error ?? event.message);
      }
    };
    const handleUnhandledQiankunRejection = (event: PromiseRejectionEvent) => {
      if (isReadableStreamClosedError(event.reason)) {
        event.preventDefault();
        handleRuntimeError(event.reason);
      }
    };

    window.addEventListener("error", handleUnhandledQiankunError);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledQiankunRejection
    );

    async function bootMiniApp() {
      try {
        await ensureQiankunErrorHandler((error) => {
          handleRuntimeError(error);
        });

        // Props are passed through Qiankun's mount channel to keep launch tokens
        // out of the address bar and browser history.
        const token = await getAccessTokenSilently().catch((error) => {
          console.warn("[auth0] access token unavailable for mini app", error);
          return undefined;
        });

        const microApp = await mountMiniApp(
          registeredApp,
          user,
          token,
          shellBridge,
          {
            onStateChange: (state) => {
              setCurrentRuntimeState(state);
            },
            onError: (error) => {
              handleRuntimeError(error);
            }
          }
        );

        if (!isCurrentRun()) {
          await microApp.unmount();
          return;
        }

        microAppRef.current = microApp;

        // Qiankun lifecycle callbacks can race with a previous unmount when a
        // user switches routes quickly. The mount promise is a second source of
        // truth so the shell does not leave a rendered mini app under a loading
        // overlay after a remount.
        microApp.mountPromise
          ?.then(() => {
            setCurrentRuntimeState("mounted");
          })
          .catch((error) => {
            handleRuntimeError(error);
          });

        mountedReconcileTimer = window.setTimeout(() => {
          const container = document.querySelector(registeredApp.container);

          if (container?.childElementCount) {
            setRuntimeState((state) =>
              isCurrentRun() && (state === "idle" || state === "loading")
                ? "mounted"
                : state
            );
          }
        }, 1200);
      } catch (error) {
        handleRuntimeError(error);
      }
    }

    bootMiniApp();

    return () => {
      disposed = true;
      window.removeEventListener("error", handleUnhandledQiankunError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledQiankunRejection
      );
      window.clearTimeout(mountedReconcileTimer);
      microAppRef.current
        ?.unmount()
        .catch((error) =>
          console.error("[qiankun] failed to unmount mini app", error)
        );
      microAppRef.current = null;
    };
  }, [
    app,
    appCode,
    getAccessTokenSilently,
    isAppRegistryLoading,
    shellBridge,
    user
  ]);

  const isLoading =
    isAppRegistryLoading ||
    runtimeState === "idle" ||
    runtimeState === "loading";
  const hasError = runtimeState === "error";

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <Badge className="w-fit" variant={hasError ? "destructive" : "secondary"}>
          {hasError ? <AlertCircle /> : <MonitorCog />}
          {app?.appCode ?? appCode}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
          {app?.name ?? "Mini app"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          This route is rendered by the shell while Qiankun mounts the remote
          mini app into the dedicated container below.
        </p>
      </section>

      <Card className="min-h-[700px]">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>{app?.appCode ?? appCode}</CardTitle>
              <CardDescription>Remote application mount point</CardDescription>
            </div>
            <Badge variant={hasError ? "destructive" : "outline"}>
              {isLoading ? <Loader2 className="animate-spin" /> : null}
              {hasError ? "Load failed" : runtimeState}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative min-h-[620px] overflow-hidden">
          <div id="subapp-container" className="min-h-[620px] w-full" />

          {isLoading ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-card/95 p-6"
              role="status"
            >
              <div className="grid max-w-md justify-items-center gap-3 text-center">
                <Loader2 className="size-6 animate-spin text-primary" />
                <strong className="text-base">
                  Loading {app?.name ?? "mini app"}
                </strong>
                <span className="text-sm leading-6 text-muted-foreground">
                  Preparing the mini app runtime and launch context.
                </span>
              </div>
            </div>
          ) : null}

          {hasError ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-card/95 p-6"
              role="alert"
            >
              <div className="grid max-w-md justify-items-center gap-3 text-center">
                <AlertCircle className="size-6 text-destructive" />
                <strong className="text-base">
                  {app?.name ?? "Mini app"} could not be loaded
                </strong>
                <span className="text-sm leading-6 text-muted-foreground">
                  {appRegistryError ??
                    errorMessage ??
                    "The shell caught a Qiankun lifecycle error while mounting the mini app."}
                </span>
              </div>
            </div>
          ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown mini app runtime error.";
}

function isReadableStreamClosedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("ReadableStreamDefaultController") &&
    message.includes("Cannot enqueue a chunk")
  );
}
