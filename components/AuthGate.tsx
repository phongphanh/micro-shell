"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (isLoading || isAuthenticated || isLoginRoute) {
      return;
    }

    const query = searchParams.toString();
    const returnTo = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [isAuthenticated, isLoading, isLoginRoute, pathname, router, searchParams]);

  if (isLoading) {
    return <div className="auth-loading">Checking SSO session...</div>;
  }

  if (error) {
    return (
      <div className="auth-error" role="alert">
        Auth0 error: {error.message}
      </div>
    );
  }

  if (!isAuthenticated && !isLoginRoute) {
    return <div className="auth-loading">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
