import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heptapus Sign",
  description: "Internal document approval and verification system"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
