/** @type {import('next').NextConfig} */
const nextConfig = {
  // Qiankun mini apps mount imperatively; disabling Strict Mode avoids the
  // development-only double mount/unmount cycle while testing integration.
  reactStrictMode: false
};

export default nextConfig;
