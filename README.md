# Next.js Starter Kit

Ez a projekt egy modern, TypeScript alapú Next.js starter kit Tailwind CSS-sel, ESLint-tel és Prettier-rel.

## Használat

1. Telepítés:
   ```bash
   npm install
   ```
2. Fejlesztés indítása:
   ```bash
   npm run dev
   ```
3. Lint ellenőrzés:
   ```bash
   npm run lint
   ```
4. Build készítés:
   ```bash
   npm run build
   ```

## Főbb konfigurációs fájlok

- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `.eslintrc.cjs`
- `prettier.config.js`

## Mappastruktúra

- `src/app/` – Next.js App Router kezdőpont
- `src/components/` – újrahasználható UI komponensek
- `src/lib/` – segédfüggvények, közös logika
- `src/hooks/` – custom hook-ok
