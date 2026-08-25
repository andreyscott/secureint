import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CyberQuest AI — Learn Cybersecurity by Investigating",
    template: "%s | CyberQuest AI",
  },
  description:
    "CyberQuest AI turns cybersecurity learning into interactive incident-response missions that adapt to the way you think. Investigate real-world scenarios, not memorize facts.",
  keywords: [
    "cybersecurity",
    "learning",
    "SOC",
    "incident response",
    "AI",
    "adaptive learning",
    "security operations",
    "phishing",
    "threat analysis",
  ],
  openGraph: {
    title: "CyberQuest AI",
    description: "Cybersecurity isn't memorization. It's investigation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased">
          <div className="scan-line" aria-hidden="true" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
