"use client";

import Image from "next/image";

export default function ParkMapViewer() {
  return (
    <section className="relative z-20 w-full bg-transparent">
      <div className="relative w-full bg-transparent leading-none">
        <Image
          src="/mapa/mapa.webp"
          alt="Mapa de Ki’ichpam Xunáan"
          width={1600}
          height={1400}
          priority
          sizes="100vw"
          className="block h-auto w-full select-none"
        />
      </div>
    </section>
  );
}