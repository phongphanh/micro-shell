"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toShellUser } from "@/lib/shellUser";

export function AuthActions() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user: auth0User,
  } = useAuth0();
  const user = isAuthenticated ? toShellUser(auth0User) : null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2" role="status">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="hidden h-4 w-28 sm:block" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            loginWithRedirect({
              authorizationParams: { screen_hint: "signup" },
            })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <UserPlus />
          <span className="hidden sm:inline">Sign up</span>
        </Button>
        <Button onClick={() => loginWithRedirect()} size="sm" type="button">
          <LogIn />
          <span>Sign in</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <button
            {...props}
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
              props.className,
            )}
            type="button"
          >
            {props.children}
          </button>
        )}
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-36 truncate text-sm md:inline">
          {user.displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm text-foreground">
            {user.displayName}
          </span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email ?? user.orgId}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          variant="destructive"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
