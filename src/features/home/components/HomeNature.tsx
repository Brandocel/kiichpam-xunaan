"use client";

import { useEffect, useRef, useState } from "react";

type HomeNatureProps = {
  locale?: "es" | "en";
  videoSrc?: string;
  posterSrc?: string;
};

const content = {
  es: {
    title: "Naturaleza",
    subtitle: "Explora la belleza de los cenotes y la naturaleza en Yucatán",
    videoTitle: "Video de naturaleza Ki’ichpam Xunaán",
    loading: "Cargando video...",
    errorTitle: "No se pudo cargar el video",
    errorText: "Revisa que el archivo exista correctamente en la carpeta public.",
  },
  en: {
    title: "Nature",
    subtitle: "Explore the beauty of cenotes and nature in Yucatán",
    videoTitle: "Ki’ichpam Xunaán nature video",
    loading: "Loading video...",
    errorTitle: "The video could not be loaded",
    errorText: "Please check that the file exists correctly inside the public folder.",
  },
} as const;

export default function HomeNature({
  locale = "es",
  videoSrc = "/home/videohome.mp4",
  posterSrc = "/home/home.webp",
}: HomeNatureProps) {
  const t = content[locale];

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // El video solo se descarga/reproduce cuando la sección entra en pantalla,
  // así no penaliza la carga inicial (está debajo del fold).
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [inView]);

  return (
    <section className="relative w-full overflow-hidden bg-[#0A6571]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "url('/cenote/textura.png')",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          backgroundSize: "900px auto",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1500px] px-5 pb-14 pt-10 md:px-8 md:pb-16 md:pt-12 xl:px-10 xl:pb-20">
        <div className="text-center">
          <h2 className="font-[var(--font-be-vietnam-pro)] text-[clamp(3rem,7vw,6rem)] font-extrabold leading-[1.15] tracking-[-0.01em] text-white">
            {t.title}
          </h2>

          <p className="-mt-1 font-[var(--font-be-vietnam-pro)] text-[clamp(1rem,2vw,1.625rem)] font-semibold leading-[1.48] tracking-[-0.01em] text-white">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative w-full max-w-[1320px] overflow-hidden bg-black shadow-[0_25px_55px_rgba(0,0,0,0.30)]">
            <div
              ref={containerRef}
              className="relative h-[240px] w-full sm:h-[320px] md:h-[420px] xl:h-[520px]"
            >
              {!hasError && inView && (
                <video
                  src={videoSrc}
                  title={t.videoTitle}
                  poster={posterSrc}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={false}
                  onLoadedData={() => setIsLoaded(true)}
                  onCanPlay={() => setIsLoaded(true)}
                  onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                  }}
                >
                  {t.videoTitle}
                </video>
              )}

              <div
                className="pointer-events-none absolute bottom-0 left-0 z-[5] h-[90px] w-[120px]"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)",
                }}
              />

              {!isLoaded && !hasError && (
                <div className="absolute inset-0 z-10 grid place-items-center bg-black/35">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-[42px] w-[42px] animate-spin rounded-full border-2 border-white/30 border-t-white/80" />

                    <p className="font-[var(--font-be-vietnam-pro)] text-sm font-semibold text-white/90">
                      {t.loading}
                    </p>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black px-6 text-center">
                  <h3 className="font-[var(--font-be-vietnam-pro)] text-[24px] font-extrabold text-white">
                    {t.errorTitle}
                  </h3>

                  <p className="mt-3 max-w-[520px] font-[var(--font-be-vietnam-pro)] text-[15px] font-medium leading-relaxed text-white/75">
                    {t.errorText}
                  </p>

                  <code className="mt-4 bg-white px-4 py-3 text-[14px] font-bold text-[#0A6571]">
                    {videoSrc}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}