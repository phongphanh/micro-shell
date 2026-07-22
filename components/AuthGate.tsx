"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, Loader2 } from "lucide-react";
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
    return <AuthStatusMessage message="Checking SSO session..." />;
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        role="alert"
      >
        <AlertCircle className="size-4" />
        Auth0 error: {error.message}
      </div>
    );
  }

  if (!isAuthenticated && !isLoginRoute) {
    return <AuthStatusMessage message="Redirecting to login..." />;
  }

  return <>{children}</>;
}

function AuthStatusMessage({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground"
      role="status"
    >
      <Loader2 className="size-4 animate-spin text-primary" />
      {message}
    </div>
  );
}
