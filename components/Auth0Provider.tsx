"use client";

import { Auth0Provider as ReactAuth0Provider } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { auth0Config } from "@/lib/auth0Config";

export function Auth0Provider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) {
    return <div className="auth-loading">Preparing SSO...</div>;
  }

  return (
    <ReactAuth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{ redirect_uri: origin }}
      onRedirectCallback={(appState?: AppState) => {
        router.replace(appState?.returnTo ?? window.location.pathname);
      }}
    >
      {children}
    </ReactAuth0Provider>
  );
}
