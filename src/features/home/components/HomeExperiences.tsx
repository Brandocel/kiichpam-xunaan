"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Locale = "es" | "en";

type ExperienceItem = {
  key: string;
  title: {
    es: string;
    en: string;
  };
  image: string;
  alt: {
    es: string;
    en: string;
  };
  video: string;
};

interface HomeExperiencesProps {
  locale?: Locale;
}

const ITEMS: ExperienceItem[] = [
  {
    key: "cenotes",
    title: {
      es: "Cenotes",
      en: "Cenotes",
    },
    image: "/experiences/cenotes.jpg",
    video: "/experiences/cenotes.mp4",
    alt: {
      es: "Experiencia de cenotes",
      en: "Cenotes experience",
    },
  },
  {
    key: "talleres",
    title: {
      es: "Talleres",
      en: "Workshops",
    },
    image: "/experiences/talleres.jpg",
    video: "/experiences/talleres.mp4",
    alt: {
      es: "Experiencia de talleres",
      en: "Workshops experience",
    },
  },
  {
    key: "gastronomia",
    title: {
      es: "Gastronomía",
      en: "Gastronomy",
    },
    image: "/experiences/gastronomia.jpg",
    video: "/experiences/gastronomia.mp4",
    alt: {
      es: "Experiencia gastronómica",
      en: "Gastronomy experience",
    },
  },
  {
    key: "flora-fauna",
    title: {
      es: "Flora y Fauna",
      en: "Flora and Fauna",
    },
    image: "/experiences/flora-fauna.jpg",
    video: "/experiences/flora-fauna.mp4",
    alt: {
      es: "Experiencia de flora y fauna",
      en: "Flora and fauna experience",
    },
  },
];

type CardStatus = "idle" | "ready";

const sectionText = {
  es: {
    paragraph:
      "Ubicado a 30 minutos de Valladolid, 2 horas de Mérida y Cancún, entre imponentes y místicos cenotes de aguas cristalinas con matices de colores, como el Cenote Ki’ichpam Xunáan, Cenote YunChen y Cenote Xkokay. Podrás disfrutar de un equilibrio entre el contacto con la madre naturaleza y la amplia gama de servicios y entretenimiento que el parque natural tiene para ofrecerte. Este destino es ideal para explorar los hermosos cenotes en Yucatán, los impresionantes cenotes en Valladolid, y los fascinantes cenotes en Quintana Roo.",
    tap: "Toca",
  },
  en: {
    paragraph:
      "Located 30 minutes from Valladolid and 2 hours from Mérida and Cancún, among imposing and mystical cenotes with crystal-clear waters in vibrant shades, such as Cenote Ki’ichpam Xunáan, Cenote YunChen, and Cenote Xkokay. You can enjoy a balance between contact with Mother Nature and the wide range of services and entertainment the natural park has to offer. This destination is ideal for exploring the beautiful cenotes of Yucatán, the stunning cenotes of Valladolid, and the fascinating cenotes of Quintana Roo.",
    tap: "Tap",
  },
} as const;

export default function HomeExperiences({
  locale = "es",
}: HomeExperiencesProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [statusByKey, setStatusByKey] = useState<Record<string, CardStatus>>(
    () => Object.fromEntries(ITEMS.map((item) => [item.key, "idle"]))
  );

  const [isMobile, setIsMobile] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");

    const apply = () => {
      setIsMobile(mq.matches);
    };

    apply();

    mq.addEventListener?.("change", apply);

    return () => {
      mq.removeEventListener?.("change", apply);
    };
  }, []);

  const setStatus = (key: string, next: CardStatus) => {
    setStatusByKey((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const pauseOthers = (keepKey: string) => {
    ITEMS.forEach((item) => {
      if (item.key === keepKey) return;

      const video = videoRefs.current[item.key];

      if (!video) return;

      if (!video.paused) {
        video.pause();
      }
    });
  };

  const play = async (key: string) => {
    setActiveKey(key);
    pauseOthers(key);

    if (statusByKey[key] === "idle") {
      setStatus(key, "ready");
    }

    const video = videoRefs.current[key];

    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    try {
      if (video.readyState < 2) {
        video.load();
      }

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        await promise.catch(() => {});
      }
    } catch {}
  };

  const pause = (key: string) => {
    const video = videoRefs.current[key];

    if (!video) return;

    video.pause();
    setActiveKey(null);
  };

  const onEnter = (key: string) => {
    if (isMobile) return;

    void play(key);
  };

  const onLeave = (key: string) => {
    if (isMobile) return;

    pause(key);
  };

  const onTap = (key: string) => {
    if (!isMobile) return;

    const video = videoRefs.current[key];

    if (!video) return;

    if (!video.paused) {
      pause(key);
    } else {
      void play(key);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#d7d0c6]">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.28]"
        style={{
          backgroundImage: "url('/experiences/textura.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-white/10" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 md:px-8 xl:px-10">
        <div className="mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {ITEMS.map((item) => {
              const status = statusByKey[item.key] ?? "idle";
              const showImage = status === "idle";

              const video = videoRefs.current[item.key];

              const isPlaying =
                activeKey === item.key && video && !video.paused;

              const maskHeight = isPlaying ? "h-[38%]" : "h-[200%]";

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => onEnter(item.key)}
                  onMouseLeave={() => onLeave(item.key)}
                  onClick={() => onTap(item.key)}
                  className={`
                    group relative isolate w-full overflow-hidden
                    bg-transparent
                    shadow-[0_18px_35px_rgba(0,0,0,0.18)]
                    transition-transform duration-300
                    ${
                      activeKey === item.key
                        ? "scale-[1.03]"
                        : "hover:-translate-y-1"
                    }
                    ${isMobile ? "cursor-pointer" : ""}
                  `}
                  role={isMobile ? "button" : undefined}
                  aria-label={
                    isMobile
                      ? `${
                          locale === "es"
                            ? "Reproducir o pausar"
                            : "Play or pause"
                        } ${item.title[locale]}`
                      : undefined
                  }
                >
                  <div className="relative aspect-[2/3] w-full">
                    <div className="absolute inset-0">
                      <video
                        ref={(el) => {
                          videoRefs.current[item.key] = el;
                        }}
                        className="h-full w-full object-cover"
                        src={item.video}
                        playsInline
                        muted
                        loop
                        preload="auto"
                      />
                    </div>

                    {showImage && (
                      <>
                        <Image
                          src={item.image}
                          alt={item.alt[locale]}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 460px"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-black/10" />
                      </>
                    )}

                    <div
                      className={`
                        pointer-events-none absolute inset-x-0 bottom-0
                        ${maskHeight}
                        bg-gradient-to-t
                        from-[#4b2a78]/90
                        via-[#4b2a78]/40
                        to-transparent
                        transition-all duration-500 ease-out
                      `}
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-5 pb-5">
                      <h3 className="text-center text-[28px] font-extrabold leading-[1] tracking-[-0.02em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:text-[30px]">
                        {item.title[locale]}
                      </h3>
                    </div>

                    {isMobile && (
                      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[12px] text-white/90">
                        {sectionText[locale].tap}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-10 w-full text-justify text-[18px] leading-[1.7] text-[#483289]">
            {sectionText[locale].paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}