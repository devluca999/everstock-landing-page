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

export const metadata: Metadata = {
  title: "Everstock — Agentic procurement for mid-market distributors",
  description:
    "Everstock watches vendor pricing inside limits you set and queues every purchase for your approval. Deterministic spine, agentic edges — nothing moves a dollar until you sign off.",
};

export const viewport: Viewport = {
  themeColor: "#16171B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${unbounded.variable} ${anton.variable} ${syne.variable} ${plex.variable} ${plexMono.variable}`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
