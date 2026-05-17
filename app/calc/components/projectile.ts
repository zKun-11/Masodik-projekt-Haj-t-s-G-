export type ProjectileInput = {
  angleDeg: number;
  initialSpeed: number;
  releaseHeight: number;
  gravity?: number;
};

export type ProjectileResult = {
  angleRad: number;
  horizontalSpeed: number;
  verticalSpeed: number;
  timeOfFlight: number;
  distance: number;
  maxHeight: number;
};

export function calculateProjectile({
  angleDeg,
  initialSpeed,
  releaseHeight,
  gravity = 9.81,
}: ProjectileInput): ProjectileResult {
  const angleRad = (angleDeg * Math.PI) / 180;
  const horizontalSpeed = initialSpeed * Math.cos(angleRad);
  const verticalSpeed = initialSpeed * Math.sin(angleRad);

  // Solves y = h + v_y*t - 0.5*g*t^2 for the positive landing time.
  const discriminant = verticalSpeed ** 2 + 2 * gravity * releaseHeight;
  const timeOfFlight = (verticalSpeed + Math.sqrt(Math.max(discriminant, 0))) / gravity;

  const distance = horizontalSpeed * timeOfFlight;
  const maxHeight = releaseHeight + verticalSpeed ** 2 / (2 * gravity);

  return {
    angleRad,
    horizontalSpeed,
    verticalSpeed,
    timeOfFlight,
    distance,
    maxHeight,
  };
}

export function estimateSpeedFromForce(force: number, mass: number, pushDistance: number): number {
  // Work-energy estimate: F*s = 1/2*m*v^2, so v = sqrt(2Fs/m)
  if (force <= 0 || mass <= 0 || pushDistance <= 0) return 0;
  return Math.sqrt((2 * force * pushDistance) / mass);
}

export function estimateForceFromSpeed(speed: number, mass: number, pushDistance: number): number {
  // Rearranged work-energy formula: F = (m*v^2)/(2*s)
  if (speed <= 0 || mass <= 0 || pushDistance <= 0) return 0;
  return (mass * speed ** 2) / (2 * pushDistance);
}

export function round(value: number, digits = 2): number {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}
