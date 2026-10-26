import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Yellowtail } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/matchpa/site-header";
import { SessionProvider } from "@/lib/session";
import { QueryProvider } from "@/components/matchpa/query-provider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
const yellowtail = Yellowtail({
  variable: "--font-yellowtail",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: { default: "MatchPa", template: "%s · MatchPa" },
  description: "Encuentra jugadores y completa tu partido de pádel.",
};

export const viewport: Viewport = {
  themeColor: "#003c3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bricolage.variable} ${yellowtail.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <SessionProvider>
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
