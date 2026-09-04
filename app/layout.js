import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: {
    template: "%s — Sipher Street Capital",
    default: "Sipher Street Capital — Independent Investment Partnership",
  },
  description:
    "An independent investment management partnership deploying concentrated long/short equity strategies across global markets with disciplined risk management.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-light.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{localStorage.removeItem("sipher_theme");document.documentElement.setAttribute("data-theme","azure");}catch(e){}})();`,
            }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="preload"
            href="/videos/ocean-waves.mp4"
            as="video"
            type="video/mp4"
            fetchPriority="high"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </body>
      </html>
    </ViewTransitions>
  );
}
