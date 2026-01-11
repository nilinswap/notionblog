import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Metadata } from "next";
import Header from "@/header";
export const metadata: Metadata = {
  title: {
    template: "%s | Nilinswap's Blog",
    default: "Nilinswap's Blog",
  },
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        
        <Header />
        {children}
      </body>
    </html>
  );
}
