"use client";

import { useMemo, useState } from "react";
import {
  calculateProjectile,
  estimateForceFromSpeed,
  estimateSpeedFromForce,
  round,
} from "./projectile";

type Mode = "force" | "speed";

export default function ThrowDistanceCalculator() {
  const [mode, setMode] = useState<Mode>("force");
  const [angleDeg, setAngleDeg] = useState(45);
  const [force, setForce] = useState(120);
  const [initialSpeed, setInitialSpeed] = useState(14);
  const [mass, setMass] = useState(0.15);
  const [pushDistance, setPushDistance] = useState(0.8);
  const [releaseHeight, setReleaseHeight] = useState(1.7);

  const speed = useMemo(() => {
    return mode === "force"
      ? estimateSpeedFromForce(force, mass, pushDistance)
      : initialSpeed;
  }, [mode, force, mass, pushDistance, initialSpeed]);

  const requiredForce = useMemo(() => {
    return estimateForceFromSpeed(initialSpeed, mass, pushDistance);
  }, [initialSpeed, mass, pushDistance]);

  const result = useMemo(() => {
    return calculateProjectile({
      angleDeg,
      initialSpeed: speed,
      releaseHeight,
    });
  }, [angleDeg, speed, releaseHeight]);

  const chartPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const steps = 24;

    for (let i = 0; i <= steps; i++) {
      const t = (result.timeOfFlight / steps) * i;
      const x = result.horizontalSpeed * t;
      const y = releaseHeight + result.verticalSpeed * t - 0.5 * 9.81 * t ** 2;
      points.push({ x, y: Math.max(y, 0) });
    }

    return points;
  }, [result, releaseHeight]);

  const maxX = Math.max(...chartPoints.map((p) => p.x), 1);
  const maxY = Math.max(...chartPoints.map((p) => p.y), 1);
  const polyline = chartPoints
    .map((p) => `${(p.x / maxX) * 100},${100 - (p.y / maxY) * 85}`)
    .join(" ");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Physics project
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Throw Distance Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Enter an angle and either throw force or starting speed. The calculator
            estimates flight time, max height, and horizontal distance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex rounded-2xl bg-slate-900 p-1">
              <button
                onClick={() => setMode("force")}
                className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
                  mode === "force" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                }`}
              >
                Force mode
              </button>
              <button
                onClick={() => setMode("speed")}
                className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
                  mode === "speed" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                }`}
              >
                Speed mode
              </button>
            </div>

            <NumberInput label="Throw angle" unit="°" value={angleDeg} setValue={setAngleDeg} min={0} max={90} />

            {mode === "force" ? (
              <NumberInput label="Throw force" unit="N" value={force} setValue={setForce} min={0} />
            ) : (
              <NumberInput label="Starting speed" unit="m/s" value={initialSpeed} setValue={setInitialSpeed} min={0} />
            )}

            <NumberInput label="Object mass" unit="kg" value={mass} setValue={setMass} min={0.01} step={0.01} />
            <NumberInput label="Push distance" unit="m" value={pushDistance} setValue={setPushDistance} min={0.01} step={0.05} />
            <NumberInput label="Release height" unit="m" value={releaseHeight} setValue={setReleaseHeight} min={0} step={0.05} />

            <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              {mode === "force" ? (
                <p>Estimated starting speed: <b>{round(speed)} m/s</b></p>
              ) : (
                <p>Estimated force needed: <b>{round(requiredForce)} N</b></p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard title="Distance" value={`${round(result.distance)} m`} highlight />
              <ResultCard title="Flight time" value={`${round(result.timeOfFlight)} s`} />
              <ResultCard title="Max height" value={`${round(result.maxHeight)} m`} />
              <ResultCard title="Horizontal speed" value={`${round(result.horizontalSpeed)} m/s`} />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                <span>Trajectory preview</span>
                <span>not to scale, but close enough for school goblin math</span>
              </div>
              <svg viewBox="0 0 100 100" className="h-72 w-full overflow-visible rounded-2xl bg-slate-900">
                <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-slate-600" strokeWidth="1" />
                <polyline points={polyline} fill="none" stroke="currentColor" className="text-cyan-300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="0" cy={100 - (releaseHeight / maxY) * 85} r="2" className="fill-cyan-300" />
                <circle cx="100" cy="100" r="2" className="fill-cyan-300" />
              </svg>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Formula idea:</p>
              <p className="mt-1">
                Force mode estimates speed from work-energy: F × s = ½mv².
                Then projectile motion uses x = vₓt and y = h + vᵧt - ½gt².
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function NumberInput({
  label,
  unit,
  value,
  setValue,
  min,
  max,
  step = 1,
}: {
  label: string;
  unit: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="mb-4 block">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200">
        <span>{label}</span>
        <span className="text-cyan-300">{value} {unit}</span>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function ResultCard({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-white"}`}>
      <p className={`text-sm font-semibold ${highlight ? "text-slate-800" : "text-slate-400"}`}>{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
