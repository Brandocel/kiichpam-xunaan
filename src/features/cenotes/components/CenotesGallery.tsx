import Image from "next/image";

const galleryImages = [
  {
    src: "/cenotepage/galeria/estalaquita.png",
    alt: "Cenote con estalactitas",
    className: "col-span-2 row-span-1",
  },
  {
    src: "/cenotepage/galeria/pareja.png",
    alt: "Pareja en cenote",
    className: "col-span-1 row-span-2",
  },
  {
    src: "/cenotepage/galeria/chica.png",
    alt: "Persona nadando en cenote",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/puente.png",
    alt: "Puente en cenote",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/escalera.png",
    alt: "Escalera en cenote",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/bicicleta.png",
    alt: "Bicicletas en la entrada",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/cenotepuente.png",
    alt: "Vista de cenote",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/vista.png",
    alt: "Persona flotando",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/cenotepage/galeria/cenoteyun.webp",
    alt: "Cenote Yun Chen",
    className: "col-span-2 row-span-1",
  },
];

export default function CenotesGallery() {
  return (
    <section className="relative w-full overflow-hidden bg-[#00586F] pb-10 pt-10 sm:pt-12 md:pt-14 lg:pt-16">
      <div
        className="absolute inset-0 bg-repeat opacity-45"
        style={{
          backgroundImage: "url('/cenotepage/galeria/textura.png')",
          backgroundSize: "420px auto",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,88,111,0.95)_0%,rgba(0,88,111,0.86)_42%,rgba(0,88,111,0.62)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1512px] px-5 sm:px-6 md:px-10 lg:px-[80px] xl:px-[92px]">
        <div className="mb-8 flex items-center justify-center gap-6 md:mb-10 lg:mb-12">
          <span className="h-[2px] flex-1 bg-white/80" />

          <h2
            className="text-center text-[32px] font-black leading-none text-white sm:text-[38px] md:text-[44px] lg:text-[48px]"
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Galería
          </h2>

          <span className="h-[2px] flex-1 bg-white/80" />
        </div>

        <div className="hidden grid-cols-4 auto-rows-[190px] gap-[12px] lg:grid xl:auto-rows-[210px]">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className={`relative overflow-hidden ${image.className}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className="relative h-[230px] overflow-hidden sm:h-[260px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}