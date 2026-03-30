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
          <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-white/60">
            Clock icon by {" "}
            <a
              href="https://icons8.com/icons/set/clock--static--purple"
              title="Clock icon set by Icons8"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-cyan-300"
            >
              Icons8
            </a>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}