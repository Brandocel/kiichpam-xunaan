import "./globals.css";
import type { ReactNode } from "react";
import { Poppins, Be_Vietnam_Pro } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "900"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${beVietnamPro.variable} font-[var(--font-poppins)]`}
      >
        {children}
      </body>
    </html>
  );
}