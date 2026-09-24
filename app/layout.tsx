import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "LingoLens — Học từ vựng qua ống kính",
  description:
    "Chụp ảnh vật thể xung quanh và học ngay từ vựng kèm phiên âm, phát âm và dịch nghĩa.",
};

export const viewport = {
  themeColor: "#0a0a0a",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full bg-neutral-950 antialiased font-sans"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-neutral-950"
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          theme="dark"
          duration={2000}
          offset={80}
          mobileOffset={80}
        />
      </body>
    </html>
  );
}

