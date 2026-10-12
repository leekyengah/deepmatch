import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import { AdminShell } from "@/components/layout/AdminShell";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { getHtmlLang, getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "DeepMatch Admin",
  description: "Operations, moderation, CMS, feature flags",
  icons: {
    icon: [{ url: "/brand/deepmatch-symbol.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/deepmatch-symbol.svg" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const lang = await getHtmlLang();

  return (
    <html lang={lang}>
      <body
        className={`${display.variable} ${body.variable} ${body.className} antialiased`}
      >
        <I18nProvider locale={locale}>
          <ToastProvider>
            <AdminShell>{children}</AdminShell>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
