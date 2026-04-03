"use client";

import { useMemo, useState } from "react";

type HomeNatureProps = {
  locale?: "es" | "en";
  youtubeUrl?: string;
};

function extractYouTubeId(url: string) {
  const patterns = [
    /v=([a-zA-Z0-9_-]{6,})/,
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /embed\/([a-zA-Z0-9_-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return url;
}

const content = {
  es: {
    title: "Naturaleza",
    subtitle: "Explora la belleza de los cenotes y la naturaleza en Yucatán",
  },
  en: {
    title: "Nature",
    subtitle: "Explore the beauty of cenotes and nature in Yucatán",
  },
} as const;

export default function HomeNature({
  locale = "es",
  youtubeUrl = "https://www.youtube.com/watch?v=YyKepsrSpk8",
}: HomeNatureProps) {
  const t = content[locale];
  const videoId = useMemo(() => extractYouTubeId(youtubeUrl), [youtubeUrl]);
  const [isLoaded, setIsLoaded] = useState(false);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: videoId,
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

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
            <div className="relative h-[240px] w-full sm:h-[320px] md:h-[420px] xl:h-[520px]">
              <iframe
                src={embedUrl}
                title="Nature video"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoaded(true)}
              />

              <div
                className="pointer-events-none absolute bottom-0 left-0 z-[5] h-[90px] w-[120px]"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)",
                }}
              />

              {!isLoaded && (
                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <div className="h-[42px] w-[42px] animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}