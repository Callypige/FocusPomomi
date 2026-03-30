"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--header-bg)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <p className="text-sm font-semibold tracking-wide text-[color:var(--foreground)]">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400" />
          FocusPomomi
        </p>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Show when="signed-out">
                <>
                    <SignInButton mode="modal">
                    <button className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-elevated)]">Se connecter</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                    <button className="rounded-xl bg-linear-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">S&apos;inscrire</button>
                    </SignUpButton>
                </>
            </Show>
            <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5">
              <span className="text-xs font-medium text-[color:var(--muted)]">Mon compte</span>
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}