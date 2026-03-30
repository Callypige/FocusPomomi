import HomeClient from "@/components/HomeClient";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen bg-(--background) p-4 md:p-8">
        <section className="mx-auto mt-20 max-w-xl rounded-3xl border border-(--border) bg-(--surface) p-8 text-center backdrop-blur">
          <h1 className="text-3xl font-bold text-(--foreground)">Bienvenue sur FocusPomomi</h1>
          <p className="mt-3 text-sm text-(--muted)">
            Connectez-vous pour accéder au timer pomodoro et à la gestion des tâches.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Show when="signed-out">
                <>
                  <SignInButton mode="modal">
                    <button className="rounded-xl border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--surface-elevated)">Se connecter</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-xl bg-linear-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">S&apos;inscrire</button>
                  </SignUpButton>
                </>
            </Show>
          </div>
        </section>
      </main>
    );
  }

  return <HomeClient />;
}