import type { Metadata } from "next";
import "./globals.css";
import { AppFrame } from "@/components/AppFrame";
import { Auth0Provider } from "@/components/Auth0Provider";

export const metadata: Metadata = {
  title: "Super Web Shell PoC",
  description: "Next.js web shell loading micro frontends with Qiankun"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          <AppFrame>{children}</AppFrame>
        </Auth0Provider>
      </body>
    </html>
  );
}
