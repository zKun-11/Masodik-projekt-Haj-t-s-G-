// ============================================================
// projectile.ts — Hajítás fizikai modellje
// ============================================================
// Ez a fájl tartalmazza a ferde hajítás számításaihoz
// szükséges összes képletet és segédfüggvényt.
// Magyar kommentek, 9. osztályos szinten magyarázva.
// ============================================================

// A gravitációs gyorsulás értéke a Föld felszínén (m/s²)
// Ezt "g"-vel jelöljük, és közelítőleg 9,81 m/s².
export const GRAVITY = 9.81;

// Melyik módban számolunk?
export type CalcMode = 'velocity-to-distance' | 'distance-to-velocity' | 'force-to-distance';

// Egy kiszámolt röppálya összes adata
export type ProjectileResult = {
  range: number;              // Vízszintes hatótávolság (m) — mennyire repül messzire
  velocity: number;           // Kezdősebesség (m/s) — milyen gyorsan indul
  time: number;               // Repülési idő (s) — meddig van a levegőben
  maxHeight: number;          // Maximális magasság (m) — a legmagasabb pont
  horizontalVelocity: number; // Vízszintes sebességkomponens (m/s) — vx
  verticalVelocity: number;   // Függőleges sebességkomponens (m/s) — vy
  launchHeight: number;       // Indítási magasság (m) — h₀
  kineticEnergy?: number;     // Mozgási energia (J) — csak erő-módban számítjuk
};

// Egy pont a röppályán (a grafikonhoz kell)
export type TrajectoryPoint = { x: number; y: number };

// ── Segédfüggvények ─────────────────────────────────────────

// Fokból radiánba: a szögfüggvények (sin, cos) radiánt várnak,
// de mi fokokban adjuk meg a szöget, ezért át kell számítani.
// Képlet: rad = fok × (π / 180)
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Szög biztonsági korlátok közé zárása.
// 0° és 90° határesetnek számít (cos=0 vagy sin=0), ezért
// enyhén kerüljük ezeket: 0.1° – 89.9° a megengedett tartomány.
export function clampAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 45;
  return Math.min(89.9, Math.max(0.1, angle));
}

// ── Fő fizikai számítás ──────────────────────────────────────

/**
 * Röppálya kiszámítása kezdősebesség alapján, figyelembe véve
 * az indítási magasságot (h₀).
 *
 * Fizika összefoglalás:
 *   A testet v₀ sebességgel, α szögben dobjuk fel, h₀ magasságból.
 *
 *   Sebességkomponensek induláskor:
 *     vx = v₀ · cos(α)   ← vízszintes (ez egész repülés alatt állandó)
 *     vy = v₀ · sin(α)   ← függőleges (a gravitáció csökkenti)
 *
 *   Pozíció a t időpillanatban:
 *     x(t) = vx · t
 *     y(t) = h₀ + vy·t − ½·g·t²
 *
 *   Becsapódási idő (amikor y(t) = 0):
 *     Másodfokú egyenletből: t = [vy + √(vy² + 2·g·h₀)] / g
 *
 *   Maximum magasság (amikor a függőleges sebesség nullává válik):
 *     h_max = h₀ + vy² / (2·g)
 */
export function projectileFromVelocity(
  angleDegrees: number,
  velocity: number,
  launchHeight = 0,
): ProjectileResult {
  // Szög radiánba, biztonsági korlátokkal
  const angle = degreesToRadians(clampAngle(angleDegrees));

  // Negatív sebesség és magasság fizikailag értelmetlen
  const v0 = Math.max(0, velocity);
  const h0 = Math.max(0, launchHeight);

  // Szögfüggvény értékek előre kiszámítva (teljesítmény + olvashatóság)
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  // Sebességkomponensek
  const vx = v0 * cosA; // vízszintes komponens
  const vy = v0 * sinA; // függőleges komponens (kezdeti)

  // Becsapódási idő a másodfokú egyletből:
  //   h₀ + vy·t − ½·g·t² = 0
  //   ½·g·t² − vy·t − h₀ = 0
  //   t = [vy + √(vy² + 2·g·h₀)] / g
  // (csak a pozitív gyököt vesszük, a negatív fizikailag értelmetlen)
  const discriminant = vy * vy + 2 * GRAVITY * h0;
  const time = (vy + Math.sqrt(discriminant)) / GRAVITY;

  // Vízszintes hatótávolság: R = vx · t
  const range = vx * time;

  // Maximális magasság: a csúcsponton a függőleges sebesség nulla.
  // h_max = h₀ + vy² / (2·g)
  const maxHeight = h0 + (vy * vy) / (2 * GRAVITY);

  return {
    range,
    velocity: v0,
    time,
    maxHeight,
    horizontalVelocity: vx,
    verticalVelocity: vy,
    launchHeight: h0,
  };
}

// ── Távolságból sebesség ────────────────────────────────────

/**
 * Megkeresi azt a kezdősebességet, amellyel a test pontosan
 * R méterre csapódik be, adott α szöggel és h₀ magasságból.
 *
 * Ha h₀ = 0: analitikus (közvetlen képlet) megoldás van.
 *   v₀ = √(R·g / sin(2α))
 *
 * Ha h₀ > 0: bináris keresést alkalmazunk.
 *   (A képlet bonyolulttá válik, ezért 60 iterációval közelítjük.)
 */
export function velocityForDistance(
  angleDegrees: number,
  distance: number,
  launchHeight = 0,
): ProjectileResult | null {
  const angle = degreesToRadians(clampAngle(angleDegrees));
  const h0 = Math.max(0, launchHeight);
  const R = Math.max(0, distance);

  if (R <= 0) return null;

  if (h0 === 0) {
    // ── Analitikus eset (h₀ = 0) ──────────────────────────
    // R = v₀² · sin(2α) / g  →  v₀ = √(R·g / sin(2α))
    const sin2a = Math.sin(2 * angle);
    if (sin2a <= 0) return null;
    const v = Math.sqrt((R * GRAVITY) / sin2a);
    return projectileFromVelocity(angleDegrees, v, 0);
  }

  // ── Bináris keresés (h₀ > 0) ──────────────────────────────
  // Ellenőrzés: egyáltalán elérhető-e R a tartományon belül?
  const maxPossibleRange = projectileFromVelocity(angleDegrees, 1000, h0).range;
  if (maxPossibleRange < R) return null; // Még 1000 m/s-sel sem éri el

  let lo = 0.01;
  let hi = 1000;

  // 60 iteráció bőven elég: a pontosság 1000 / 2^60 ≈ 10⁻¹⁵ m
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const r = projectileFromVelocity(angleDegrees, mid, h0).range;
    if (r < R) lo = mid;
    else hi = mid;
  }

  const v = (lo + hi) / 2;
  return projectileFromVelocity(angleDegrees, v, h0);
}

// ── Erőből sebesség ─────────────────────────────────────────

/**
 * Az impulzus-tétel alapján:
 *   F · Δt = m · v₀   →   v₀ = F · Δt / m
 *
 * Ez azt jelenti: ha F erővel tolod a tárgyat Δt ideig,
 * és a tömege m, akkor ekkora sebességre gyorsítod fel.
 */
export function velocityFromForce(force: number, mass: number, pushTime: number): number {
  const safeMass = Math.max(0.001, mass); // 0-val nem oszthatunk
  const safeForce = Math.max(0, force);
  const safePushTime = Math.max(0, pushTime);
  return (safeForce * safePushTime) / safeMass;
}

/**
 * Teljes röppálya kiszámítása, ha az erő, tömeg és
 * erőkifejtési idő adott.
 */
export function projectileFromForce(
  angleDegrees: number,
  force: number,
  mass: number,
  pushTime: number,
  launchHeight = 0,
): ProjectileResult {
  const v = velocityFromForce(force, mass, pushTime);
  const result = projectileFromVelocity(angleDegrees, v, launchHeight);

  // Mozgási energia: E_k = ½ · m · v²
  return {
    ...result,
    kineticEnergy: 0.5 * Math.max(0.001, mass) * v * v,
  };
}

// ── Trajektória-pontok generálása (a grafikonhoz) ────────────

/**
 * Kiszámolja a röppálya diszkrét pontjait egyenlő időközönként.
 * Ezeket a pontokat az SVG-grafikon rajzolja ki.
 *
 * Képletek:
 *   x(t) = vx · t
 *   y(t) = h₀ + vy · t − ½ · g · t²
 *
 * A t = 0 az indítás, t = T a becsapódás pillanata.
 */
export function generateTrajectoryPoints(
  result: ProjectileResult,
  numPoints = 140,
): TrajectoryPoint[] {
  // Ha nincs értelmes eredmény, üres tömböt adunk vissza
  if (result.time <= 0 || result.velocity <= 0) return [];

  const { horizontalVelocity: vx, verticalVelocity: vy, launchHeight: h0, time: T } = result;

  const points: TrajectoryPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    // Az aktuális időpillanat (0-tól T-ig egyenletesen)
    const t = (i / numPoints) * T;

    // Vízszintes pozíció (egyenletes mozgás)
    const x = vx * t;

    // Függőleges pozíció (egyenletesen változó mozgás + gravitáció)
    const y = h0 + vy * t - 0.5 * GRAVITY * t * t;

    // Csak a talaj felett lévő pontokat vesszük fel
    // (kis lebegőpontos hiba esetén nullára kerekítjük)
    if (y >= -0.001) {
      points.push({ x, y: Math.max(0, y) });
    }
  }

  return points;
}

// ── Formázás ─────────────────────────────────────────────────

// Szám megjelenítése magyar formátumban (pl. "1 234,56")
export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}
