"use client";

import Link from "next/link";

// objektum típus:
type LinkType = {
  href: string;
  label: string;
};

// export const pi: number = 3.14;

// string típusú tömb:
// export const napok: string[] = ["Hétfő", "Kedd", "szerda"];

// Saját objektum típusú tömb
const links: LinkType[] = [
  { href: "/alapok", label: "Alapok" },
  { href: "/heron", label: "Háromszög K-T by Heron" },
  { href: "/teglalap", label: "Téglalap K-T" },
  { href: "/lnko-kivonasos", label: "LNKO Kivonásos" },
  { href: "/lnko-euklidesz", label: "LNKO Euklidesz" },
];

export default function AlapokPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200">
      <div className="flex w-80 flex-col items-center rounded-lg bg-white p-5 shadow-xl">
        <h1 className="text-xl font-semibold">TypeScript alapok - 09.A</h1>
        <ul className="mt-3">
          {links.map((link, index) => (
            <li key={index}>
              <Link className="text-blue-500 hover:text-red-500 hover:bg-gray-100 rounded-full px-3"  href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}