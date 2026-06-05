import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospela — AI Lead Generator",
  description: "Generate verified B2B leads with AI-powered web scraping.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;530;560;600;680;700&family=Inter:wght@400;450;500;550;560;600&family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,560;9..144,680&family=Newsreader:ital,wght@0,400;0,500;1,400&family=Spline+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
