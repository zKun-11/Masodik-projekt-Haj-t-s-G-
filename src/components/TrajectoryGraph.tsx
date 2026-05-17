'use client';

// ============================================================
// TrajectoryGraph.tsx — Animált SVG röppálya-grafikon
// ============================================================
// Ez a komponens rajzolja ki a koordináta-rendszert és benne
// a ferde hajítás pályagörbéjét. Minden bemeneti változtatáskor
// újra "lerajzolja" magát animáció segítségével.
//
// Technikai megoldás:
//   - Tiszta SVG (nincs külső könyvtár)
//   - stroke-dashoffset CSS animáció = "rajzolódó vonal" effekt
//   - Dinamikus tengelybeosztás: az értékek mindig a dobáshoz igazodnak
//   - Neon glow: SVG feGaussianBlur szűrő
// ============================================================

import { useEffect, useMemo, useRef } from 'react';
import { GRAVITY, type ProjectileResult, generateTrajectoryPoints } from '@/lib/projectile';

interface TrajectoryGraphProps {
  result: ProjectileResult | null;
}

// ── Tengelybeosztás-generáló ─────────────────────────────────

// "Szép" kerek értékre kerekítés — hogy ne 13,7-et írjon ki,
// hanem például 15-öt vagy 20-at.
function niceNumber(value: number, round: boolean): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const frac = value / Math.pow(10, exp);
  let niceFrac: number;
  if (round) {
    if (frac < 1.5) niceFrac = 1;
    else if (frac < 3.5) niceFrac = 2;
    else if (frac < 7.5) niceFrac = 5;
    else niceFrac = 10;
  } else {
    if (frac <= 1) niceFrac = 1;
    else if (frac <= 2) niceFrac = 2;
    else if (frac <= 5) niceFrac = 5;
    else niceFrac = 10;
  }
  return niceFrac * Math.pow(10, exp);
}

// Beosztás-értékek generálása (pl. [0, 10, 20, 30, 40])
function generateTicks(maxValue: number, targetCount = 5): number[] {
  if (maxValue <= 0) return [0];
  const rawStep = maxValue / targetCount;
  const step = niceNumber(rawStep, true);
  const ticks: number[] = [];
  for (let v = 0; v <= maxValue + step * 0.5; v += step) {
    ticks.push(Math.round(v * 10000) / 10000);
  }
  return ticks;
}

// Szám rövid megjelenítése a tengelyen (pl. 1500 → "1.5k")
function formatTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  if (value >= 100) return `${Math.round(value)}`;
  if (Number.isInteger(value)) return `${value}`;
  return `${parseFloat(value.toFixed(1))}`;
}

// ── Fő komponens ─────────────────────────────────────────────

export default function TrajectoryGraph({ result }: TrajectoryGraphProps) {
  // A pályavonal SVG path elemének referenciája (az animációhoz kell)
  const pathRef = useRef<SVGPathElement>(null);

  // ── SVG méretezés ────────────────────────────────────────────
  // A viewBox fix méretű, de a CSS width: 100% miatt reszponzív.
  const PAD = { top: 44, right: 36, bottom: 54, left: 58 };
  const VIEW_W = 580;
  const VIEW_H = 340;
  const IW = VIEW_W - PAD.left - PAD.right; // belső szélesség
  const IH = VIEW_H - PAD.top - PAD.bottom; // belső magasság

  // ── Skálázási tartomány ──────────────────────────────────────
  // 8%-os extra helyet hagyunk a becsapódási jelző felett/mellett.
  const maxX = result ? Math.max(result.range * 1.1, 1) : 10;
  const maxY = result ? Math.max(result.maxHeight * 1.22, result.launchHeight * 1.5, 1) : 5;

  // ── Trajektória-pontok ────────────────────────────────────────
  const points = useMemo(() => {
    if (!result || result.velocity <= 0 || result.time <= 0) return [];
    return generateTrajectoryPoints(result, 160);
  }, [result]);

  // ── Tengelybeosztások ────────────────────────────────────────
  const xTicks = useMemo(() => generateTicks(maxX, 5), [maxX]);
  const yTicks = useMemo(() => generateTicks(maxY, 4), [maxY]);

  // ── SVG path szöveg ──────────────────────────────────────────
  // Fizikai koordinátákat (x, y méterben) SVG pixelekre számítjuk.
  // Az y-tengelyt megfordítjuk: fizikában felfelé nő, SVG-ben lefelé.
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => {
        const sx = (p.x / maxX) * IW;
        const sy = IH - (p.y / maxY) * IH;
        return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`;
      })
      .join(' ');
  }, [points, maxX, maxY, IW, IH]);

  // ── "Rajzolódó" animáció ─────────────────────────────────────
  // A stroke-dashoffset trükk:
  //   1. A vonal teljes hosszát kiszámoljuk (getTotalLength)
  //   2. A strokeDasharray = teljes hossz, strokeDashoffset = teljes hossz
  //      → a vonal "eltűnik" (a dash pont annyira eltolva, hogy semmi nem látszik)
  //   3. CSS transition segítségével dashOffset → 0-ra animálunk
  //      → a vonal fokozatosan "lerajzolódik" balról jobbra
  useEffect(() => {
    const path = pathRef.current;
    if (!path || pathD === '') return;

    // Átmenet kikapcsolása a reset előtt (ne animáljon visszafelé)
    path.style.transition = 'none';
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    // Dupla requestAnimationFrame: biztosítjuk, hogy a böngésző
    // feldolgozza a reset ELŐTT elindítja az animációt.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.33, 1, 0.68, 1)';
        path.style.strokeDashoffset = '0';
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathD]); // pathD változásakor (= új dobásnál) újraindul az animáció

  // ── Különleges pontok pozíciói az SVG-n ──────────────────────
  const isEmpty = !result || points.length === 0;

  // Indítási pont (bal oldalon, h₀ magasságon)
  const launchSY = result ? IH - (result.launchHeight / maxY) * IH : IH;

  // Csúcspont: az az időpillanat, amikor a függőleges sebesség nulla
  // t_csúcs = vy / g
  const peakTime = result ? result.verticalVelocity / GRAVITY : 0;
  const apexSX = result ? (result.horizontalVelocity * peakTime / maxX) * IW : 0;
  const apexSY = result ? IH - (result.maxHeight / maxY) * IH : IH;

  // Becsapódási pont (jobb oldalon, talaj szinten)
  const landingSX = result ? (result.range / maxX) * IW : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900 shadow-2xl shadow-purple-900/40">
      {/* Háttér ambient glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_55%_45%_at_62%_35%,rgba(168,85,247,0.10)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_40%_35%_at_30%_70%,rgba(56,189,248,0.06)_0%,transparent_60%)]" />

      {/* Fejléc */}
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-400/80">
          Röppálya — koordináta-rendszer
        </p>
        {!isEmpty && (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/70" />
            <span className="text-xs font-semibold text-slate-400">Élő</span>
          </div>
        )}
      </div>

      {/* SVG koordináta-rendszer */}
      <div className="w-full overflow-x-auto px-1 pb-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full min-w-[300px]"
          style={{ maxHeight: '340px' }}
          aria-label="Röppálya koordináta-rendszer"
        >
          <defs>
            {/* Neon glow szűrő: az izzó vonalhatásért */}
            <filter id="tg-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="1.5" result="blur2" in="SourceGraphic" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gyengébb glow a pont-jelzőkhöz */}
            <filter id="tg-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Szivárvány gradiens a pályavonalhoz (lila → cián → kék) */}
            <linearGradient id="tg-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Halvány terület-kitöltés a vonal alatt */}
            <linearGradient id="tg-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Belső rajzterület: a padding-ot translate-tel kezeljük ── */}
          <g transform={`translate(${PAD.left}, ${PAD.top})`}>

            {/* ── Rácsvonalak ───────────────────────────────────────── */}
            {xTicks.map((tick) => {
              const sx = (tick / maxX) * IW;
              return (
                <line
                  key={`xg-${tick}`}
                  x1={sx} y1={0} x2={sx} y2={IH}
                  stroke="rgba(148,163,184,0.07)"
                  strokeWidth="1"
                />
              );
            })}
            {yTicks.map((tick) => {
              const sy = IH - (tick / maxY) * IH;
              return (
                <line
                  key={`yg-${tick}`}
                  x1={0} y1={sy} x2={IW} y2={sy}
                  stroke="rgba(148,163,184,0.07)"
                  strokeWidth="1"
                />
              );
            })}

            {/* ── Tengelyek ─────────────────────────────────────────── */}
            {/* X tengely (talaj) */}
            <line
              x1={0} y1={IH} x2={IW} y2={IH}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1.5"
            />
            {/* Y tengely */}
            <line
              x1={0} y1={0} x2={0} y2={IH}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1.5"
            />

            {/* ── X tengely beosztásai és feliratai ─────────────────── */}
            {xTicks.map((tick) => {
              const sx = (tick / maxX) * IW;
              return (
                <g key={`xt-${tick}`}>
                  <line
                    x1={sx} y1={IH}
                    x2={sx} y2={IH + 5}
                    stroke="rgba(148,163,184,0.45)"
                    strokeWidth="1"
                  />
                  <text
                    x={sx} y={IH + 18}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="rgba(148,163,184,0.7)"
                    fontFamily="ui-monospace, monospace"
                  >
                    {formatTick(tick)}
                  </text>
                </g>
              );
            })}

            {/* ── Y tengely beosztásai és feliratai ─────────────────── */}
            {yTicks.map((tick) => {
              const sy = IH - (tick / maxY) * IH;
              return (
                <g key={`yt-${tick}`}>
                  <line
                    x1={-5} y1={sy}
                    x2={0} y2={sy}
                    stroke="rgba(148,163,184,0.45)"
                    strokeWidth="1"
                  />
                  <text
                    x={-8} y={sy + 3.5}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="rgba(148,163,184,0.7)"
                    fontFamily="ui-monospace, monospace"
                  >
                    {formatTick(tick)}
                  </text>
                </g>
              );
            })}

            {/* ── Tengelycímkék ─────────────────────────────────────── */}
            <text
              x={IW / 2} y={IH + 40}
              textAnchor="middle"
              fontSize="11.5"
              fill="rgba(192,132,252,0.7)"
              fontFamily="ui-sans-serif, sans-serif"
              fontWeight="600"
            >
              Vízszintes távolság (m)
            </text>
            <text
              x={-(IH / 2)} y={-46}
              textAnchor="middle"
              fontSize="11.5"
              fill="rgba(192,132,252,0.7)"
              fontFamily="ui-sans-serif, sans-serif"
              fontWeight="600"
              transform="rotate(-90)"
            >
              Magasság (m)
            </text>

            {/* ── Üres állapot üzenet ───────────────────────────────── */}
            {isEmpty && (
              <text
                x={IW / 2} y={IH / 2 + 6}
                textAnchor="middle"
                fontSize="13"
                fill="rgba(148,163,184,0.38)"
                fontFamily="ui-sans-serif, sans-serif"
              >
                Add meg az adatokat — a röppálya itt jelenik meg
              </text>
            )}

            {/* ── Terület-kitöltés a vonal alatt (esztétikai elem) ─── */}
            {!isEmpty && pathD !== '' && (
              <path
                d={`${pathD} L ${(result!.range / maxX) * IW} ${IH} L 0 ${IH - (result!.launchHeight / maxY) * IH} Z`}
                fill="url(#tg-area-grad)"
              />
            )}

            {/* ── Animált röppálya-vonal ───────────────────────────── */}
            {!isEmpty && (
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="url(#tg-line-grad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tg-glow)"
              />
            )}

            {/* ── Jelölő pontok ─────────────────────────────────────── */}

            {/* Indítási pont (lila) */}
            {!isEmpty && (
              <g filter="url(#tg-dot-glow)">
                <circle cx={0} cy={launchSY} r={7} fill="rgba(192,132,252,0.25)" />
                <circle cx={0} cy={launchSY} r={4.5} fill="#c084fc" />
                <circle cx={0} cy={launchSY} r={2} fill="white" />
              </g>
            )}

            {/* Csúcspont (cián / sky) */}
            {!isEmpty && (
              <g filter="url(#tg-dot-glow)">
                <circle cx={apexSX} cy={apexSY} r={7} fill="rgba(56,189,248,0.22)" />
                <circle cx={apexSX} cy={apexSY} r={4.5} fill="#38bdf8" />
                <circle cx={apexSX} cy={apexSY} r={2} fill="white" />
                {/* Felugró felirat a csúcspont magasságával */}
                <text
                  x={apexSX + 9}
                  y={apexSY - 7}
                  fontSize="10"
                  fill="rgba(56,189,248,0.9)"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="700"
                >
                  {result
                    ? `${parseFloat(result.maxHeight.toFixed(1))} m`
                    : ''}
                </text>
              </g>
            )}

            {/* Becsapódási pont (indigo) */}
            {!isEmpty && (
              <g filter="url(#tg-dot-glow)">
                <circle cx={landingSX} cy={IH} r={7} fill="rgba(129,140,248,0.25)" />
                <circle cx={landingSX} cy={IH} r={4.5} fill="#818cf8" />
                <circle cx={landingSX} cy={IH} r={2} fill="white" />
                {/* Lefelé ugró felirat a becsapódási távolsággal */}
                <text
                  x={landingSX}
                  y={IH + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(129,140,248,0.9)"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="700"
                >
                  {result
                    ? `${parseFloat(result.range.toFixed(1))} m`
                    : ''}
                </text>
              </g>
            )}

            {/* Origó felirat */}
            <text
              x={-4} y={IH + 16}
              textAnchor="end"
              fontSize="10"
              fill="rgba(148,163,184,0.45)"
              fontFamily="ui-monospace, monospace"
            >
              0
            </text>

          </g>
        </svg>
      </div>

      {/* Jelmagyarázat */}
      {!isEmpty && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 px-5 py-3">
          <LegendItem color="#c084fc" label="Indítási pont" />
          <LegendItem color="#38bdf8" label="Csúcspont" />
          <LegendItem color="#818cf8" label="Becsapódás" />
        </div>
      )}
    </div>
  );
}

// Apró jelmagyarázat-elem (szín + szöveges leírás)
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}
