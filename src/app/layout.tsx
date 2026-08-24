import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/query-provider";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/context/TransitionContext";

// Real, actually-loaded fonts for the --font-sans / --font-mono theme
// tokens in globals.css. Both previously resolved to Geist, which is not
// installed, so the whole "monospaced telemetry" aesthetic rendered in the
// browser default stack. Montserrat is self-hosted (public/fonts); the mono
// face is self-hosted at build time via next/font/google — no external
// requests at runtime, no new font files to source.
const montserratFont = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.woff2",
  variable: "--font-montserrat",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-actual",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2cc295" },
    { media: "(prefers-color-scheme: dark)", color: "#131927" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Crevy — Carbon Registry",
  description:
    "Green project management and carbon credit marketplace for Africa and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${montserratFont.variable} ${monoFont.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <TransitionProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </TransitionProvider>
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
