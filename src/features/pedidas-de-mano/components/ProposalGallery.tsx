"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
    src: "/pedida-mano/galeria-pedidademano/pedida.png",
    altEs: "Pedida de mano",
    altEn: "Marriage proposal",
    heightClass: "h-[220px] md:h-[250px]",
  },
  {
    id: "anillo",
    src: "/pedida-mano/galeria-pedidademano/anillo.png",
    altEs: "Anillo de compromiso",
    altEn: "Engagement ring",
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

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeItem = activeIndex !== null ? galleryItems[activeIndex] : null;

  const closeCarousel = () => {
    setActiveIndex(null);
  };

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;

      return currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
    });
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;

      return currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1;
    });
  };

  useEffect(() => {
    if (activeIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCarousel();
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  return (
    <>
      <section
        id="proposal-gallery"
        className="scroll-mt-[120px] w-full bg-[#005F73] pb-20 pt-8 md:pb-24 md:pt-10"
      >
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
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="mb-[8px] break-inside-avoid overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative block w-full overflow-hidden text-left ${item.heightClass}`}
                  aria-label={
                    locale === "es"
                      ? `Abrir imagen: ${item.altEs}`
                      : `Open image: ${item.altEn}`
                  }
                >
                  <Image
                    src={item.src}
                    alt={locale === "es" ? item.altEs : item.altEn}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />

                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span
                      className="
                        rounded-full bg-white/90 px-4 py-2
                        text-[13px] font-black text-[#C028B9]
                        shadow-lg backdrop-blur-sm
                      "
                      style={{
                        fontFamily:
                          '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      {locale === "es" ? "Ver imagen" : "View image"}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeItem && activeIndex !== null && (
        <div
          className="
            fixed inset-0 z-[9999]
            flex items-center justify-center
            bg-black/90 px-4 py-5
            backdrop-blur-sm
            md:px-8 md:py-8
          "
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={closeCarousel}
            className="
              absolute right-4 top-4 z-[3]
              flex h-11 w-11 items-center justify-center
              rounded-full bg-white/15 text-white
              backdrop-blur-md transition-all duration-300
              hover:bg-white hover:text-[#C028B9]
              md:right-8 md:top-8
            "
            aria-label={locale === "es" ? "Cerrar galería" : "Close gallery"}
          >
            <X size={24} strokeWidth={3} />
          </button>

          <button
            type="button"
            onClick={goToPrevious}
            className="
              absolute left-3 top-1/2 z-[3]
              flex h-11 w-11 -translate-y-1/2 items-center justify-center
              rounded-full bg-white/15 text-white
              backdrop-blur-md transition-all duration-300
              hover:bg-white hover:text-[#C028B9]
              md:left-8 md:h-14 md:w-14
            "
            aria-label={
              locale === "es" ? "Imagen anterior" : "Previous image"
            }
          >
            <ChevronLeft size={28} strokeWidth={3} />
          </button>

          <div
            className="
              relative z-[2]
              flex h-full w-full max-w-[1180px]
              flex-col items-center justify-center
            "
          >
            <div
              className="
                relative w-full overflow-hidden rounded-[18px]
                bg-black/30 shadow-2xl
                h-[68vh]
                sm:h-[72vh]
                md:h-[78vh]
              "
            >
              <Image
                key={activeItem.id}
                src={activeItem.src}
                alt={locale === "es" ? activeItem.altEs : activeItem.altEn}
                fill
                priority
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <div
              className="
                mt-4 flex w-full max-w-[1180px]
                items-center justify-between gap-4
                text-white
              "
            >
              <p
                className="line-clamp-1 text-[13px] font-semibold text-white/90 md:text-[15px]"
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {locale === "es" ? activeItem.altEs : activeItem.altEn}
              </p>

              <p
                className="shrink-0 text-[13px] font-bold text-white/80 md:text-[15px]"
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {activeIndex + 1} / {galleryItems.length}
              </p>
            </div>

            <div className="mt-4 hidden w-full max-w-[980px] gap-2 overflow-x-auto px-1 pb-2 md:flex">
              {galleryItems.map((item, index) => (
                <button
                  key={`thumb-${item.id}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-[10px] transition-all duration-300",
                    activeIndex === index
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-55 hover:opacity-100",
                  ].join(" ")}
                  aria-label={
                    locale === "es"
                      ? `Ver imagen ${index + 1}`
                      : `View image ${index + 1}`
                  }
                >
                  <Image
                    src={item.src}
                    alt={locale === "es" ? item.altEs : item.altEn}
                    fill
                    className="object-cover"
                    sizes="92px"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="
              absolute right-3 top-1/2 z-[3]
              flex h-11 w-11 -translate-y-1/2 items-center justify-center
              rounded-full bg-white/15 text-white
              backdrop-blur-md transition-all duration-300
              hover:bg-white hover:text-[#C028B9]
              md:right-8 md:h-14 md:w-14
            "
            aria-label={locale === "es" ? "Siguiente imagen" : "Next image"}
          >
            <ChevronRight size={28} strokeWidth={3} />
          </button>
        </div>
      )}
    </>
  );
}