"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <p className="text-sm font-semibold tracking-wide text-gray-200">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400" />
          FocusPomomi
        </p>
        <div className="flex items-center gap-2">
            <Show when="signed-out">
                <>
                    <SignInButton mode="modal">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/10">Se connecter</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                    <button className="rounded-xl bg-linear-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">S&apos;inscrire</button>
                    </SignUpButton>
                </>
            </Show>
            <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-xs font-medium text-gray-300">Mon compte</span>
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}