import type { Metadata } from "next";
import "./globals.css";
import { ShellLayout } from "@/components/ShellLayout";

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
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
