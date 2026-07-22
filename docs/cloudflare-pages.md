# Cloudflare Pages deployment

This shell is deployed as a static Next.js export because all Auth0, app registry,
permissions, and Qiankun mini-app loading work happens in the browser.

## Cloudflare Pages settings

- Build command: `pnpm run pages:build`
- Build output directory: `out`
- Node.js version: `20`

Set the Auth0 application callback/logout URLs to the Cloudflare Pages preview
and production origins, otherwise the hosted shell will not complete login.

## Local direct deploy

```sh
pnpm run pages:deploy
```

`public/_redirects` keeps refreshes and deep links under mini-app routes pointed
at the shell entry pages so Qiankun can mount the active mini app client-side.
