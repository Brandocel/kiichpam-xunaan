"use client";

import Image from "next/image";

interface ProposalGalleryProps {
  items: any[];           // ← Agregado (puedes tiparlo mejor después)
  locale: "es" | "en";
}

export default function ProposalGallery({ 
  items, 
  locale 
}: ProposalGalleryProps) {
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
          {items.map((item) => (
            <div
              key={item.id}
              className="mb-[8px] break-inside-avoid overflow-hidden"
            >
              <div className={`group relative w-full ${item.heightClass || 'h-[250px]'}`}>
                <Image
                  src={item.src || item.imageUrl || ''}
                  alt={locale === "es" ? item.altEs || item.alt || '' : item.altEn || item.alt || ''}
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