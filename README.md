# Második projekt - Hajítás kalkulátor

Next.js + Tailwind CSS projekt egy egyszerű fizikai hajítás kalkulátorral.

## Indítás

```bash
npm install
npm run dev
```

Főoldal: `http://localhost:3000`

Kalkulátor: `http://localhost:3000/calc`

## Mit számol?

- kezdősebességből dobástávolságot
- kívánt távolságból szükséges kezdősebességet
- erőből becsült kezdősebességet és távolságot

Egyszerűsített modell: nincs légellenállás, az indulási és érkezési magasság azonos, g = 9,81 m/s².

## Mappastruktúra

- `src/app/` – Next.js App Router oldalak
- `src/components/` – újrahasználható UI komponensek
- `src/lib/` – segédfüggvények, közös logika
- `src/hooks/` – custom hook-ok
