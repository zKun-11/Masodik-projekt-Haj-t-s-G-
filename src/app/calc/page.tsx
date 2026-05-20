import ThrowCalculator from '@/components/ThrowCalculator';

export default function CalcPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#c084fc_0%,transparent_30%),radial-gradient(circle_at_top_right,#7dd3fc_0%,transparent_28%),linear-gradient(135deg,#ffffff_0%,#f5f3ff_42%,#dbeafe_100%)]" />
      <ThrowCalculator />
    </main>
  );
}
