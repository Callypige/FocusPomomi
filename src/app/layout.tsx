import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusPomomi 🍅",
  description: "Pomodoro timer avec gestion de tâches et récompenses de fruits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950 text-white">{children}</body>
    </html>
  );
}
