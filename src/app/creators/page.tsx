const creators = [
  {
    name: 'Zalán Kun',
    role: 'Készítő',
    initials: 'ZK',
    image: '/1000029356.jpeg',
    imagePosition: 'object-[center_28%]',
    description:
      'A projekt egyik készítője. Részt vett az oldal megtervezésében, a felület kialakításában és a projekt fejlesztésében.',
  },
  {
    name: 'Máté Kovács',
    role: 'Készítő',
    initials: 'MK',
    image: '/1000029357.jpeg',
    imagePosition: 'object-[center_53%]',
    description:
      'A projekt egyik készítője. Részt vett a fejlesztésben, a tartalom elkészítésében és a projekt működésének kialakításában.',
  },
];

export default function CreatorsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#a855f7_0%,transparent_32%),radial-gradient(circle_at_top_right,#38bdf8_0%,transparent_30%),linear-gradient(135deg,#ffffff_0%,#eef2ff_48%,#dbeafe_100%)]" />
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-400/25 blur-3xl" />
        <div className="absolute bottom-10 right-8 -z-10 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600">
              A készítők
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Akik összerakták ezt a projektet
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ez az oldal a projekt készítőit mutatja be. Itt látható, kik dolgoztak
              a program elkészítésén és milyen szerepet vállaltak a projektben.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {creators.map((creator) => (
              <article
                key={creator.name}
                className="group relative overflow-hidden rounded-4xl border border-white/80 bg-white/75 p-5 shadow-2xl shadow-blue-300/30 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-purple-300/40"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-purple-500 via-sky-400 to-blue-600" />

                <div className="rounded-3xl border-2 border-dashed border-purple-300 bg-linear-to-br from-purple-100 via-white to-sky-100 p-6 text-center">
                  <div className="mx-auto aspect-square max-h-72 max-w-72 overflow-hidden rounded-[1.75rem] border border-white bg-white/80 shadow-inner shadow-purple-200">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className={`h-full w-full object-cover ${creator.imagePosition}`}
                    />
                  </div>
                </div>

                <div className="px-2 pb-2 pt-6">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-600">
                    {creator.role}
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    {creator.name}
                  </h2>

                  <p className="mt-4 leading-7 text-slate-600">
                    {creator.description}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-100">
                      <p className="text-sm font-bold text-purple-700">Feladat</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Tervezés, fejlesztés és tesztelés.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                      <p className="text-sm font-bold text-sky-700">Projekt szerep</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Fejlesztés / megvalósítás.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}