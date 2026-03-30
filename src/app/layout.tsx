import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/app/providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FocusPomomi 🍅",
  description: "Pomodoro timer avec gestion de tâches et récompenses de fruits",
  icons: {
    icon: "/clock-icon.svg",
    shortcut: "/clock-icon.svg",
    apple: "/clock-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-950 text-white">
        <ClerkProvider>
          <Header />
          <main>
            <Providers>{children}</Providers>
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}