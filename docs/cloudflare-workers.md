# Cloudflare Workers deployment

This shell should deploy through Cloudflare Workers with the OpenNext adapter.
Cloudflare Pages static export cannot reliably serve arbitrary nested mini-app
routes such as `/apps/todo/weather` because Next.js App Router still needs a
runtime route match after hydration.

## Commands

```sh
pnpm run preview
pnpm run deploy
```

`preview` runs the app in Cloudflare's Workers runtime locally. `deploy` builds
with OpenNext and publishes the Worker.

For Cloudflare Workers Builds, use:

- Build command: `pnpm run worker:build`
- Deploy command: `pnpm run worker:deploy`
- Root directory: `/`

The project currently uses Next.js 14, which OpenNext now treats as unsupported
by the Next.js team, so `worker:build` includes OpenNext's explicit unsupported
version flag. Upgrade Next.js before removing that flag.

## Cloudflare setup

- Worker entry: `.open-next/worker.js`
- Assets directory: `.open-next/assets`
- Compatibility flag: `nodejs_compat`
- Compatibility date: `2026-07-21`

Set the Auth0 callback/logout URLs to the deployed `*.workers.dev` or custom
domain origins, otherwise SSO redirects will fail after deployment.
