import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import RoleSwitcherModal from "@/components/RoleSwitcherModal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dinail.co — Custom Nail Art & Press-On Nails",
  description:
    "Platform nail art kustomisasi untuk press-on nails dan layanan nail art dengan sistem konsultasi ukuran & desain sebelum memesan di Shopee.",
  keywords: ["nail art", "press on nails", "custom nails", "konsultasi nail", "dinail"],
  openGraph: {
    title: "dinail.co — Custom Nail Art",
    description: "Karya Nail Art Presisi yang Didesain Khusus untuk Jari Kamu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body
        className={poppins.className}
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        <RoleProvider>
          {children}
          <RoleSwitcherModal />
        </RoleProvider>
      </body>
    </html>
  );
}
