import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/footer";
;

export const metadata: Metadata = {
  title: "Storybook",
  description: "Interact Worldwide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`h-screen w-screen`}>
        {children}
      </body>
    </html>
  );
}