"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const {
    error,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user,
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
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              SW
            </span>
            <div className="grid min-w-0">
              <strong className="truncate text-sm font-semibold">
                Super Web Shell
              </strong>
              <span className="truncate text-xs text-muted-foreground">
                Qiankun micro frontend host
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Badge className="w-fit" variant="secondary">
              <ShieldCheck />
              SSO required
            </Badge>
            <CardTitle className="text-3xl">Sign in with SSO</CardTitle>
            <CardDescription className="text-base leading-7">
              Use your Auth0 organization identity to launch mini apps with a
              shared shell session and secure integration context.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {isLoading ? (
            <div className="grid gap-3 rounded-lg border bg-muted/40 p-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : isAuthenticated ? (
            <div className="rounded-lg border border-primary/20 bg-accent p-4 text-sm font-medium text-accent-foreground">
              Logged in as {user?.email ?? user?.name ?? "authenticated user"}.
              Redirecting...
            </div>
          ) : (
            <div className="grid gap-3">
              {error ? (
                <div
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
                  role="alert"
                >
                  Auth0 error: {error.message}
                </div>
              ) : null}
              <Button
                className="h-11"
                onClick={() =>
                  loginWithRedirect({
                    appState: { returnTo },
                    authorizationParams: { screen_hint: "signup" },
                  })
                }
                type="button"
              >
                <UserPlus />
                Sign up
              </Button>
              <Button
                className="h-11"
                onClick={() => loginWithRedirect({ appState: { returnTo } })}
                type="button"
                variant="outline"
              >
                <LogIn />
                Log in
              </Button>
            </div>
          )}

          <p className="text-sm leading-6 text-muted-foreground">
            This Auth0 SPA app is configured for{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
              http://localhost:3000/
            </code>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function normalizeReturnTo(returnTo?: string | null) {
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }

  const normalizedPath = returnTo.split(/[?#]/, 1)[0]?.replace(/\/+$/, "");

  if (normalizedPath === "/login") {
    return "/";
  }

  return returnTo;
}
