import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora, Playfair_Display } from "next/font/google";
import { SentryInit } from "@/components/SentryInit";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { getHtmlLang, getRequestLocale } from "@/lib/i18n/server";
import { t as translate } from "@deepmatch/i18n";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const editorial = Lora({
  variable: "--font-editorial",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: "DeepMatch",
    description: translate(locale, "marketing.heroSupport"),
    icons: {
      icon: [{ url: "/brand/deepmatch-symbol.svg", type: "image/svg+xml" }],
      apple: [{ url: "/brand/deepmatch-symbol.svg" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const lang = await getHtmlLang();

  return (
    <html lang={lang}>
      <body
        className={`${display.variable} ${editorial.variable} ${body.variable} antialiased`}
      >
        <I18nProvider locale={locale}>
          <SentryInit />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
