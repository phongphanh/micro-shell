"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const {
    error,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user
  } = useAuth0();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, returnTo, router]);

  return (
    <section className="login-page">
      <div className="login-panel">
        <div className="shell-brand">
          <span className="shell-logo" aria-hidden="true">
            SW
          </span>
          <div className="shell-title">
            <strong>Super Web Shell</strong>
            <span>Qiankun micro frontend host</span>
          </div>
        </div>

        <div className="login-copy">
          <h1>Sign in with SSO</h1>
          <p>
            Use your Auth0 organization identity to launch mini apps with a
            shared shell session and secure integration context.
          </p>
        </div>

        {isLoading ? (
          <div className="auth-loading">Checking SSO session...</div>
        ) : isAuthenticated ? (
          <div className="login-config-warning" role="status">
            Logged in as {user?.email ?? user?.name ?? "authenticated user"}.
            Redirecting...
          </div>
        ) : (
          <div className="login-buttons">
            {error ? (
              <div className="auth-error" role="alert">
                Auth0 error: {error.message}
              </div>
            ) : null}
            <button
              className="login-button"
              onClick={() =>
                loginWithRedirect({
                  appState: { returnTo },
                  authorizationParams: { screen_hint: "signup" }
                })
              }
              type="button"
            >
              Sign up
            </button>
            <button
              className="login-button login-button-secondary"
              onClick={() => loginWithRedirect({ appState: { returnTo } })}
              type="button"
            >
              Log in
            </button>
          </div>
        )}

        <p className="login-help">
          This Auth0 SPA app is configured for{" "}
          <code>http://localhost:3000/</code>.
        </p>
      </div>
    </section>
  );
}

function normalizeReturnTo(returnTo?: string | null) {
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }

  return returnTo;
}
