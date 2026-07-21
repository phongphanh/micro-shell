"use client";

import { useEffect, useRef, useState } from "react";
import type { MicroApp } from "qiankun";
import { getMiniAppByCode } from "@/lib/appRegistry";
import {
  ensureQiankunErrorHandler,
  mountMiniApp,
  type MiniAppRuntimeState
} from "@/lib/qiankunRuntime";

export function MiniAppViewport({ appCode }: { appCode: string }) {
  const app = getMiniAppByCode(appCode);
  const microAppRef = useRef<MicroApp | null>(null);
  const [runtimeState, setRuntimeState] =
    useState<MiniAppRuntimeState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!app) {
      setRuntimeState("error");
      setErrorMessage(`Mini app "${appCode}" is not active or registered.`);
      return;
    }

    const registeredApp = app;
    let disposed = false;

    if (registeredApp.standaloneFallback) {
      // The deployed Todo app is currently a standalone Vite app. Loading it
      // through Qiankun executes its host-relative router before lifecycle
      // validation fails, which can push paths like /tasks into the shell.
      setRuntimeState("standalone");
      setErrorMessage(null);
      return;
    }

    const handleRuntimeError = (error: unknown) => {
      const message = formatError(error);

      setRuntimeState("error");
      setErrorMessage(message);
    };

    async function bootMiniApp() {
      try {
        await ensureQiankunErrorHandler((error) => {
          if (!disposed) {
            handleRuntimeError(error);
          }
        });

        // Props are passed through Qiankun's mount channel to keep launch tokens
        // out of the address bar and browser history.
        const microApp = await mountMiniApp(registeredApp, {
          onStateChange: (state) => {
            if (!disposed) {
              setRuntimeState(state);
            }
          },
          onError: (error) => {
            if (!disposed) {
              handleRuntimeError(error);
            }
          }
        });

        if (disposed) {
          await microApp.unmount();
          return;
        }

        microAppRef.current = microApp;
        microApp.mountPromise?.catch((error) => {
          if (!disposed) {
            handleRuntimeError(error);
          }
        });
      } catch (error) {
        if (!disposed) {
          handleRuntimeError(error);
        }
      }
    }

    bootMiniApp();

    return () => {
      disposed = true;
      microAppRef.current
        ?.unmount()
        .catch((error) =>
          console.error("[qiankun] failed to unmount mini app", error)
        );
      microAppRef.current = null;
    };
  }, [app, appCode]);

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
