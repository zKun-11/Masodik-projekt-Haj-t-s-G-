<<<<<<< HEAD
import Link from 'next/link';

const menuItems = [
  {
    href: '/calc',
    title: 'Hajítás kalkulátor',
    text: 'Számold ki a dobás távolságát, kezdősebességét vagy a szükséges sebességet.',
    badge: 'Számolás',
  },
  {
    href: '/creators',
    title: 'Készítők',
    text: 'Ismerd meg a projekt készítőit: Máté Kovács és Zalán Kun.',
    badge: 'Csapat',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#c084fc_0%,transparent_30%),radial-gradient(circle_at_top_right,#7dd3fc_0%,transparent_28%),linear-gradient(135deg,#ffffff_0%,#f5f3ff_42%,#dbeafe_100%)]" />
        <div className="absolute left-10 top-24 -z-10 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute bottom-16 right-8 -z-10 h-80 w-80 rounded-full bg-sky-300/35 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600">Fizika projekt</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Hajítás számoló, tiszta UI-val és kevés szenvedéssel.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Válassz modult, add meg az adatokat, és a program kiszámolja az eredményt. A számolás légellenállás nélkül,
              földfelszíni nehézségi gyorsulással történik.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-2xl shadow-blue-200/50 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-purple-300/40"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-600 via-sky-400 to-blue-600" />
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 ring-1 ring-purple-200">
                    {item.badge}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-sky-500 text-2xl font-black text-white shadow-lg shadow-purple-200 transition group-hover:scale-110">
                    →
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-sky-600">Megnyitás</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
=======
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
>>>>>>> 01bddbf4c1e9f5ab240400391ca2858120ed6bf4
    </main>
  );
}
