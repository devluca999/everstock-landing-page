import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Unbounded,
  Anton,
  Syne,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeScript } from "./theme";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space",
  display: "swap",
});
const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-unbounded",
  display: "swap",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-syne",
  display: "swap",
});
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-plex",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const TITLE = "Everstock — Agentic procurement for mid-market distributors";
const DESCRIPTION =
  "Everstock watches vendor pricing inside limits you set and queues every purchase for your approval. Deterministic spine, agentic edges — nothing moves a dollar until you sign off.";
const SITE_URL = "https://tryeverstock.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Everstock",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Everstock",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#16171B",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Everstock",
      url: SITE_URL,
      logo: `${SITE_URL}/logo/logo-mark-dark.svg`,
      description:
        "Agentic procurement infrastructure for mid-market distributors.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Everstock",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${unbounded.variable} ${anton.variable} ${syne.variable} ${plex.variable} ${plexMono.variable}`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
