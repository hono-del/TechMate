import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "e-library Next — Service Knowledge Platform",
  description: "Context-aware service knowledge for automotive technicians",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
