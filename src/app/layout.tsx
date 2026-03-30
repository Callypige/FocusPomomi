import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/app/providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FocusPomomi - Pomodoro Timer & Task Manager",
  description: "Pomodoro timer avec gestion de tâches et récompenses de fruits",
  icons: {
    icon: "/clock-icon.png",
    shortcut: "/clock-icon.png",
    apple: "/clock-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-(--background) text-(--foreground)">
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