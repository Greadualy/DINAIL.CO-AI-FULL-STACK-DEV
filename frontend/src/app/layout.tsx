import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import RoleSwitcherModal from "@/components/RoleSwitcherModal";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dinail.co"),
  title: {
    default: "dinail.co — Custom Press-On Nails & Nail Art",
    template: "%s | dinail.co",
  },
  description:
    "Layanan custom press-on nails dan nail art buatan tangan dari dinail.co dengan konsultasi desain serta pengukuran kuku presisi sebelum memesan.",
  keywords: [
    "nail art",
    "press on nails",
    "custom press-on nails",
    "custom nails yogyakarta",
    "konsultasi ukuran kuku",
    "dinail.co",
  ],
  icons: {
    icon: [{ url: "/images/Logo.webp", type: "image/webp" }],
    shortcut: "/images/Logo.webp",
    apple: "/images/Logo.webp",
  },
  openGraph: {
    title: "dinail.co — Custom Press-On Nails & Nail Art",
    description:
      "Karya custom press-on nails dan nail art presisi yang didesain khusus untuk ukuran jari kamu bersama nail artist dinail.co.",
    siteName: "dinail.co",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/hero_nail_art.webp",
        width: 1200,
        height: 630,
        alt: "dinail.co — Custom Press-On Nails & Nail Art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dinail.co — Custom Press-On Nails & Nail Art",
    description:
      "Karya custom press-on nails dan nail art presisi yang didesain khusus untuk ukuran jari kamu.",
    images: ["/images/hero_nail_art.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable} suppressHydrationWarning>
      <body
        className={poppins.className}
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        <RoleProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
          <RoleSwitcherModal />
        </RoleProvider>
      </body>
    </html>
  );
}
