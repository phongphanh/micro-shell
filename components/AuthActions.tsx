"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { toShellUser } from "@/lib/shellUser";

export function AuthActions() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user: auth0User
  } = useAuth0();
  const user = isAuthenticated ? toShellUser(auth0User) : null;

  if (isLoading) {
    return <span className="shell-user">Checking session...</span>;
  }

  if (!user) {
    return (
      <div className="auth-actions">
        <button
          className="auth-button"
          onClick={() =>
            loginWithRedirect({
              authorizationParams: { screen_hint: "signup" }
            })
          }
          type="button"
        >
          Sign up
        </button>
        <button
          className="auth-button auth-button-primary"
          onClick={() => loginWithRedirect()}
          type="button"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="auth-actions">
      <div className="shell-user">
        <strong>{user.displayName}</strong>
        <span>{user.orgId}</span>
      </div>
      <button
        className="auth-button"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
