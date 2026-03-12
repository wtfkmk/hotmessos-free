import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hot Mess OS — Creator Economy Readiness",
  description: "A cheeky AI-powered diagnostic for creators and business owners. Figure out what's broken, fix your mess, and build a life online without becoming a slave to tools or hustle culture.",
  openGraph: {
    title: "Hot Mess OS",
    description: "Find out your Creator Economy Readiness level. Free AI diagnostic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}