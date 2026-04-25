"use client";

import Image from "next/image";

interface ProposalGalleryProps {
  locale: "es" | "en";
}

type GalleryImage = {
  id: string;
  src: string;
  altEs: string;
  altEn: string;
  heightClass: string;
};

const galleryItems: GalleryImage[] = [
  {
    id: "yunchen",
    src: "/pedida-mano/galeria-pedidademano/Yunchen.png",
    altEs: "Letrero de Yunchen",
    altEn: "Yunchen sign",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "manos",
    src: "/pedida-mano/galeria-pedidademano/Manos.png",
    altEs: "Pareja tomada de la mano",
    altEn: "Couple holding hands",
    heightClass: "h-[300px] md:h-[380px]",
  },
  {
    id: "xunnan",
    src: "/pedida-mano/galeria-pedidademano/Xunnan.png",
    altEs: "Letrero de Xunaan",
    altEn: "Xunaan sign",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "pareja",
    src: "/pedida-mano/galeria-pedidademano/pareja.png",
    altEs: "Pareja en el parque",
    altEn: "Couple in the park",
    heightClass: "h-[220px] md:h-[260px]",
  },
  {
    id: "pedida",
    src: "/pedida-mano/galeria-pedidademano/anillo.png",
    altEs: "Pedida de mano",
    altEn: "Marriage proposal",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "anillo",
    src: "/pedida-mano/galeria-pedidademano/leopardo.png",
    altEs: "Leopardo descansando",
    altEn: "Resting leopard",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "beso",
    src: "/pedida-mano/galeria-pedidademano/beso.png",
    altEs: "Pareja sonriendo",
    altEn: "Smiling couple",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "puente",
    src: "/pedida-mano/galeria-pedidademano/Puente.png",
    altEs: "Puente del cenote",
    altEn: "Cenote bridge",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "cenote",
    src: "/pedida-mano/galeria-pedidademano/cenote.png",
    altEs: "Pareja en el cenote",
    altEn: "Couple in the cenote",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "pedida2",
    src: "/pedida-mano/galeria-pedidademano/pedida2.png",
    altEs: "Pedida nocturna",
    altEn: "Night proposal",
    heightClass: "h-[300px] md:h-[380px]",
  },
  {
    id: "puente2",
    src: "/pedida-mano/galeria-pedidademano/puente2.png",
    altEs: "Camino del cenote",
    altEn: "Cenote pathway",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "pedida3",
    src: "/pedida-mano/galeria-pedidademano/pedida3.png",
    altEs: "Cena romántica",
    altEn: "Romantic dinner",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "bendicion",
    src: "/pedida-mano/galeria-pedidademano/bendicion.png",
    altEs: "Bendición maya",
    altEn: "Mayan blessing",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "bendicion3",
    src: "/pedida-mano/galeria-pedidademano/bendicion3.png",
    altEs: "Ceremonia especial",
    altEn: "Special ceremony",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "ramo",
    src: "/pedida-mano/galeria-pedidademano/ramo.png",
    altEs: "Entrega de ramo",
    altEn: "Bouquet presentation",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "puente3",
    src: "/pedida-mano/galeria-pedidademano/puente3.png",
    altEs: "Puente con luz natural",
    altEn: "Bridge with natural light",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "puentesolo",
    src: "/pedida-mano/galeria-pedidademano/puentesolo.png",
    altEs: "Puente solo",
    altEn: "Bridge alone",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "escalera",
    src: "/pedida-mano/galeria-pedidademano/escalera.png",
    altEs: "Escalera del cenote",
    altEn: "Cenote staircase",
    heightClass: "h-[220px] md:h-[250px]",
  },
];

export default function ProposalGallery({ locale }: ProposalGalleryProps) {
  const title = locale === "es" ? "Galería" : "Gallery";

  return (
    <section className="w-full bg-[#005F73] pb-20 pt-8 md:pb-24 md:pt-10">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-10 xl:px-16">
        <div className="mb-10 flex items-center justify-center gap-4 md:mb-14 md:gap-8">
          <div className="h-px flex-1 bg-white/80" />
          <h2
            className="text-center text-[30px] font-black leading-[1.15] text-white md:text-[42px]"
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            {title}
          </h2>
          <div className="h-px flex-1 bg-white/80" />
        </div>

        <div className="columns-1 gap-[8px] sm:columns-2 lg:columns-3 xl:columns-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="mb-[8px] break-inside-avoid overflow-hidden"
            >
              <div className={`group relative w-full ${item.heightClass}`}>
                <Image
                  src={item.src}
                  alt={locale === "es" ? item.altEs : item.altEn}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}