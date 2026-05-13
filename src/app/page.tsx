import Container from '@/components/Container';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Container>
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-start justify-center gap-6 py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Next.js starter</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Modern fejlesztői környezet készen áll</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Ez a kezdő projekt tartalmazza a Next.js App Routert, TypeScriptet, Tailwind CSS-t, ESLint-et és
            Prettier-t azonnali használatra.
          </p>
        </section>
      </Container>
    </main>
  );
}
