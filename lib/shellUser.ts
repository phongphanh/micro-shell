import type { User } from "@auth0/auth0-react";

export type ShellUser = {
  userId: string;
  displayName: string;
  email?: string;
  orgId: string;
  roles: string[];
};

type Auth0UserClaims = User & {
  org_id?: string;
  "https://super-web-shell.example.com/org_id"?: string;
  "https://super-web-shell.example.com/roles"?: string[];
};

export function toShellUser(auth0User?: User): ShellUser | null {
  if (!auth0User) {
    return null;
  }

  const user = auth0User as Auth0UserClaims;

  return {
    userId: user.sub ?? "unknown-user",
    displayName: user.name ?? user.nickname ?? user.email ?? "Authenticated user",
    email: user.email,
    orgId:
      user.org_id ??
      user["https://super-web-shell.example.com/org_id"] ??
      "default-org",
    roles: user["https://super-web-shell.example.com/roles"] ?? ["user"]
  };
}
