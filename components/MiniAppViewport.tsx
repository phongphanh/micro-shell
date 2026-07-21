"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { MicroApp } from "qiankun";
import { getMiniAppByCode } from "@/lib/appRegistry";
import {
  ensureQiankunErrorHandler,
  mountMiniApp,
  type MiniAppRuntimeState
} from "@/lib/qiankunRuntime";
import { toShellUser } from "@/lib/shellUser";
import { useShellNavigation } from "@/components/ShellNavigationContext";

export function MiniAppViewport({ appCode }: { appCode: string }) {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const { shellBridge } = useShellNavigation();
  const user = useMemo(() => toShellUser(auth0User), [auth0User]);
  const app = getMiniAppByCode(appCode);
  const microAppRef = useRef<MicroApp | null>(null);
  const mountRunIdRef = useRef(0);
  const [runtimeState, setRuntimeState] =
    useState<MiniAppRuntimeState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    if (!app) {
      handleRuntimeError(`Mini app "${appCode}" is not active or registered.`);
      return;
    }

    const registeredApp = app;
    setRuntimeState("loading");
    setErrorMessage(null);

    if (registeredApp.standaloneFallback) {
      // The deployed Todo app is currently a standalone Vite app. Loading it
      // through Qiankun executes its host-relative router before lifecycle
      // validation fails, which can push paths like /tasks into the shell.
      setCurrentRuntimeState("standalone");
      return;
    }

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
      window.clearTimeout(mountedReconcileTimer);
      microAppRef.current
        ?.unmount()
        .catch((error) =>
          console.error("[qiankun] failed to unmount mini app", error)
        );
      microAppRef.current = null;
    };
  }, [app, appCode, getAccessTokenSilently, shellBridge, user]);

  const isLoading = runtimeState === "idle" || runtimeState === "loading";
  const hasError = runtimeState === "error";
  const isStandalone = runtimeState === "standalone";

  return (
    <>
      <section className="page-heading">
        <h1>{app?.name ?? "Mini app"}</h1>
        <p>
          This route is rendered by the shell while Qiankun mounts the remote
          Todo Manager into the dedicated container below.
        </p>
      </section>

      <section className="status-panel">
        <div className="miniapp-toolbar">
          <strong>{app?.appCode ?? appCode}</strong>
          <span
            className={`status-pill${hasError ? " status-pill-error" : ""}`}
          >
            {hasError
              ? "Load failed"
              : isStandalone
                ? "standalone"
                : runtimeState}
          </span>
        </div>

        <div className="miniapp-frame">
          <div id="subapp-container">
            {isStandalone && app ? (
              <iframe
                className="standalone-miniapp"
                src={app.entry}
                title={app.name}
              />
            ) : null}
          </div>

          {isLoading ? (
            <div className="miniapp-overlay" role="status">
              <div className="miniapp-message">
                <strong>Loading Todo Manager</strong>
                <span>Preparing the mini app runtime and launch context.</span>
              </div>
            </div>
          ) : null}

          {hasError ? (
            <div className="miniapp-overlay" role="alert">
              <div className="miniapp-message">
                <strong>Todo Manager could not be loaded</strong>
                <span>
                  {errorMessage ??
                    "The shell caught a Qiankun lifecycle error while mounting the mini app."}
                </span>
              </div>
            </div>
          ) : null}

          {isStandalone ? (
            <div className="miniapp-compat-note" role="status">
              Rendering the current Todo deployment in standalone compatibility
              mode until it exports Qiankun lifecycle functions.
            </div>
          ) : null}
        </div>
      </section>
    </>
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
