'use client';

// ============================================================
// ThrowCalculator.tsx — Ferde hajítás kalkulátor
// ============================================================
// Ez a komponens a teljes kalkulátor oldalt alkotja:
//   - Bal panel: mód-választó + bemeneti mezők
//   - Jobb panel: eredmény-kártya + animált röppálya-grafikon
//                 + részletes eredménykártyák + képlet-blokk
//
// Három számítási mód:
//   1. Sebesség → távolság  (leggyakoribb)
//   2. Távolság → sebesség  (visszaszámolás)
//   3. Erő → távolság       (fizikailag pontosabb becslés)
// ============================================================

import { useMemo, useState } from 'react';
import {
  type CalcMode,
  formatNumber,
  projectileFromForce,
  projectileFromVelocity,
  velocityForDistance,
} from '@/lib/projectile';
import TrajectoryGraph from '@/components/TrajectoryGraph';

// A három számítási mód leíró adatai
const MODES: { id: CalcMode; title: string; description: string }[] = [
  {
    id: 'velocity-to-distance',
    title: 'Sebesség → távolság',
    description: 'Ha tudod a kezdősebességet és a szöget.',
  },
  {
    id: 'distance-to-velocity',
    title: 'Távolság → sebesség',
    description: 'Adott távolsághoz számítja ki a szükséges sebességet.',
  },
  {
    id: 'force-to-distance',
    title: 'Erő → távolság',
    description: 'Ha a dobóerőből becsülöd a kezdősebességet.',
  },
];

// ── Újrafelhasználható szám-beviteli mező ────────────────────

interface NumberInputProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
  min?: number;
  step?: number;
}

function NumberInput({ label, unit, value, onChange, helper, min = 0, step = 0.1 }: NumberInputProps) {
  return (
    <label className="block rounded-2xl border border-purple-100/80 bg-white/70 p-4 shadow-sm shadow-sky-100/50 transition hover:border-purple-200">
      <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
        {label}
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          {unit}
        </span>
      </span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          // Strip leading zeros (e.g. "05" → "5"), but keep "0" intact
          const stripped = raw.replace(/^0+(?=\d)/, '');
          e.target.value = stripped;
          const parsed = parseFloat(stripped);
          onChange(isNaN(parsed) ? 0 : parsed);
        }}
        className="mt-3 w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-lg font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/70"
      />
      {helper && (
        <span className="mt-2 block text-xs leading-5 text-slate-500">{helper}</span>
      )}
    </label>
  );
}

// ── Statisztika elem (doboz nélküli, csak tipográfia) ────────

function StatItem({
  title,
  value,
  unit,
  accent = false,
}: {
  title: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 basis-[calc(50%-12px)] flex-col gap-0.5 sm:basis-[calc(33.333%-16px)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className={`text-2xl font-black leading-none tabular-nums ${accent ? 'text-purple-700' : 'text-slate-800'}`}>
        {value}
        <span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

// ── Fő kalkulátor komponens ──────────────────────────────────

export default function ThrowCalculator() {
  // ── Állapotváltozók ───────────────────────────────────────
  // Minden bemeneti mező saját state-ben él, hogy az értékek
  // változásakor a React automatikusan újraszámolja az eredményt.

  const [mode, setMode] = useState<CalcMode>('velocity-to-distance');

  // Minden módban használt paraméterek
  const [angle, setAngle] = useState(45);       // dobási szög (α) [°]
  const [launchHeight, setLaunchHeight] = useState(0); // indítási magasság (h₀) [m]

  // Mód-specifikus paraméterek
  const [velocity, setVelocity] = useState(20);   // kezdősebesség [m/s]
  const [distance, setDistance] = useState(40);   // célzott távolság [m]
  const [force, setForce] = useState(120);         // dobóerő [N]
  const [mass, setMass] = useState(0.5);           // tárgy tömege [kg]
  const [pushTime, setPushTime] = useState(0.12);  // erőkifejtési idő [s]

  // ── Fizikai számítás ──────────────────────────────────────
  // useMemo: csak akkor számol újra, ha a bemenetek változnak.
  // Ez teljesítmény-optimalizálás: felesleges újraszámítást kerülünk el.
  const result = useMemo(() => {
    if (mode === 'velocity-to-distance') {
      return projectileFromVelocity(angle, velocity, launchHeight);
    }
    if (mode === 'distance-to-velocity') {
      return velocityForDistance(angle, distance, launchHeight);
    }
    // force-to-distance mód
    return projectileFromForce(angle, force, mass, pushTime, launchHeight);
  }, [angle, distance, force, launchHeight, mass, mode, pushTime, velocity]);

  // ── Megjelenítés ──────────────────────────────────────────
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">

      {/* ══════════════════════════════════════════════════════
          BAL PANEL — Mód-választó + bemeneti mezők
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5 rounded-4xl border border-white/80 bg-white/80 p-5 shadow-2xl shadow-blue-200/50 backdrop-blur-xl sm:p-7">

        {/* Fejléc */}
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-purple-600">
            Hajítás kalkulátor
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Dobás számoló
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Válaszd ki a számítási módot, add meg az adatokat — az eredmény
            és a röppálya azonnal frissül. Légellenállás nincs a modellben.
          </p>
        </div>

        {/* Mód-választó gombok */}
        <div className="grid gap-3">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                mode === item.id
                  ? 'border-purple-300 bg-linear-to-r from-purple-600 to-sky-500 text-white shadow-lg shadow-purple-200'
                  : 'border-purple-100 bg-white/70 text-slate-950 hover:border-sky-300 hover:bg-sky-50/80'
              }`}
            >
              <span className="block font-black">{item.title}</span>
              <span
                className={`mt-1 block text-sm ${
                  mode === item.id ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                {item.description}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bemeneti mezők ──────────────────────────────── */}
        <div className="grid gap-4">

          {/* SZÖG — minden módban megjelenik */}
          <NumberInput
            label="Dobási szög"
            unit="°"
            value={angle}
            min={0.1}
            step={1}
            onChange={setAngle}
            helper="45°-nál a legnagyobb a vízszintes távolság (h₀=0 esetén). Ez a ferde hajítás 'aranyszöge'."
          />

          {/* INDÍTÁSI MAGASSÁG — minden módban megjelenik */}
          <NumberInput
            label="Indítási magasság (h₀)"
            unit="m"
            value={launchHeight}
            min={0}
            step={0.5}
            onChange={setLaunchHeight}
            helper="Ha talajszintről dobsz, ez 0. Ha emelt helyzetből (pl. erkélyről), add meg méterben."
          />

          {/* MÓD-SPECIFIKUS MEZŐK */}

          {mode === 'velocity-to-distance' && (
            <NumberInput
              label="Kezdősebesség (v₀)"
              unit="m/s"
              value={velocity}
              onChange={setVelocity}
              helper="Mennyi sebességgel indul a tárgy. Példa: 10 m/s = könnyű dobás, 25 m/s = erős dobás."
            />
          )}

          {mode === 'distance-to-velocity' && (
            <NumberInput
              label="Célzott távolság (R)"
              unit="m"
              value={distance}
              onChange={setDistance}
              helper="Ennyire kell eljutnia a tárgynak. A program visszaszámolja a szükséges sebességet."
            />
          )}

          {mode === 'force-to-distance' && (
            <>
              <NumberInput
                label="Dobóerő (F)"
                unit="N"
                value={force}
                onChange={setForce}
                helper="Newtonban megadva. Egy átlagos felnőtt dobóereje: 80–200 N körül. Ez becslés."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Tömeg (m)"
                  unit="kg"
                  value={mass}
                  onChange={setMass}
                  helper="Tárgy tömege. Pl. 0,5 kg = kézilabda."
                />
                <NumberInput
                  label="Erőkifejtés ideje (Δt)"
                  unit="s"
                  value={pushTime}
                  onChange={setPushTime}
                  step={0.01}
                  helper="Meddig gyorsítja a kéz a tárgyat. Tipikusan 0,1–0,2 s."
                />
              </div>
            </>
          )}
        </div>

        {/* Képlet-blokk */}
        <div className="mt-auto rounded-3xl border border-purple-100 bg-linear-to-br from-purple-50/80 to-sky-50/60 p-5 text-sm leading-7 text-slate-600">
          <p className="mb-2 font-black text-purple-700">Alkalmazott képletek:</p>
          <div className="space-y-1 font-mono text-xs text-slate-700">
            {/* Sebességkomponensek */}
            <p><span className="font-bold text-purple-600">vx</span> = v₀ · cos(α)</p>
            <p><span className="font-bold text-purple-600">vy</span> = v₀ · sin(α)</p>
            {/* Pozíció az időben */}
            <p><span className="font-bold text-sky-600">x(t)</span> = vx · t</p>
            <p><span className="font-bold text-sky-600">y(t)</span> = h₀ + vy·t − ½·g·t²</p>
            {/* Becsapódási idő */}
            <p><span className="font-bold text-indigo-600">t</span> = [vy + √(vy² + 2·g·h₀)] / g</p>
            {/* Max magasság */}
            <p><span className="font-bold text-indigo-600">h_max</span> = h₀ + vy² / (2·g)</p>
            {/* Erőből sebesség */}
            {mode === 'force-to-distance' && (
              <p><span className="font-bold text-rose-500">v₀</span> = F · Δt / m &nbsp;(impulzus-tétel)</p>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            g = 9,81 m/s² · Légellenállás nincs figyelembe véve.
          </p>
        </div>
      </div>

      {/*JOBB PANEL — Eredmények + animált grafikon*/}

      <div className="flex flex-col gap-5 rounded-4xl border border-white/80 bg-white/80 p-5 shadow-2xl shadow-purple-200/50 backdrop-blur-xl sm:p-7">

        {/* ── Fő eredménykártya (gradiens hero) ───────────── */}
        <div className="flex items-end justify-between gap-4 rounded-3xl bg-linear-to-br from-purple-600 via-violet-600 to-sky-500 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
              Becsapódási távolság
            </p>
            <h2 className="mt-1 text-4xl font-black leading-none text-white tabular-nums sm:text-5xl">
              {result ? `${formatNumber(result.range)} m` : '—'}
            </h2>
          </div>
          {result && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Repülési idő</p>
              <p className="text-xl font-black text-white tabular-nums">{formatNumber(result.time)} s</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Csúcsmagasság</p>
              <p className="text-xl font-black text-white tabular-nums">{formatNumber(result.maxHeight)} m</p>
            </div>
          )}
          {!result && (
            <p className="text-sm text-white/60">Add meg az adatokat.</p>
          )}
        </div>

        {/* ── Animált SVG röppálya-grafikon ───────────────── */}
        <TrajectoryGraph result={result ?? null} />

        {/* ── Statisztikai sáv (doboz nélküli flex, nincs üres cella) ── */}
        {result && (
          <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-5">
            <StatItem title="Kezdősebesség" value={formatNumber(result.velocity)} unit="m/s" accent />
            <StatItem title="Repülési idő" value={formatNumber(result.time)} unit="s" accent />
            <StatItem title="Max magasság" value={formatNumber(result.maxHeight)} unit="m" />
            <StatItem title="Vízszintes sebesség" value={formatNumber(result.horizontalVelocity)} unit="m/s" />
            <StatItem title="Függőleges sebesség" value={formatNumber(result.verticalVelocity)} unit="m/s" />
            {typeof result.kineticEnergy === 'number' && (
              <StatItem title="Mozgási energia" value={formatNumber(result.kineticEnergy)} unit="J" />
            )}
          </div>
        )}

        {/* Nincs eredmény üzenet */}
        {!result && (
          <p className="py-2 text-center text-sm text-slate-400">
            Próbálj nagyobb távolságot, vagy módosítsd a szöget / sebességet.
          </p>
        )}
      </div>
    </section>
  );
}
