import HomeClient from "@/components/HomeClient";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <section className="mx-auto mt-20 max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <h1 className="text-3xl font-bold text-white">Bienvenue sur FocusPomomi</h1>
          <p className="mt-3 text-sm text-gray-300">
            Connectez-vous pour accéder au timer pomodoro et à la gestion des tâches.
          </p>
          <div className="mt-6 flex justify-center gap-3">
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
          </div>
        </section>
      </main>
    );
  }

  return <HomeClient />;
}