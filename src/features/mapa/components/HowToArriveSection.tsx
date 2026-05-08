"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type SocialItem = {
  alt: string;
  href: string;
  src: string;
};

type RouteVideoItem = {
  id: string;
  label: string;
  src: string;
  description: string;
};

type HowToArriveSectionProps = {
  titleLight?: string;
  titleBold?: string;
  addressLines?: string[];
  phone?: string;
  buttonLabel?: string;
  googleMapsUrl?: string;
  mapEmbedUrl?: string;
  followUsLabel?: string;
  socials?: SocialItem[];
  routeVideos?: RouteVideoItem[];
};

const DEFAULT_SOCIALS: SocialItem[] = [
  {
    alt: "Facebook",
    href: "https://www.facebook.com/kiichpamxunaan",
    src: "/mapa/social/facebook.svg",
  },
  {
    alt: "Instagram",
    href: "https://www.instagram.com/kiichpamxunaan/",
    src: "/mapa/social/instagram.svg",
  },
  {
    alt: "WhatsApp",
    href: "https://wa.me/5219987510867",
    src: "/mapa/social/whatsapp.svg",
  },
  {
    alt: "TikTok",
    href: "https://www.tiktok.com/@kiichpamxunaan?lang=es",
    src: "/mapa/social/tiktok.svg",
  },
  {
    alt: "YouTube",
    href: "https://www.youtube.com/@kiichpamxunaan",
    src: "/mapa/social/youtube.svg",
  },
];

const DEFAULT_ROUTE_VIDEOS: RouteVideoItem[] = [
  {
    id: "cancun",
    label: "Desde Cancún",
    src: "/mapa/Cancún.mp4",
    description: "Ruta sugerida saliendo desde Cancún hacia Ki’ichpam Xunaán.",
  },
  {
    id: "merida",
    label: "Desde Mérida",
    src: "/mapa/Merida.mp4",
    description: "Ruta sugerida saliendo desde Mérida hacia Ki’ichpam Xunaán.",
  },
  {
    id: "valladolid",
    label: "Desde Valladolid",
    src: "/mapa/valladolid.mp4",
    description: "Ruta sugerida saliendo desde Valladolid hacia Ki’ichpam Xunaán.",
  },
];

export default function HowToArriveSection({
  titleLight = "¿Cómo llegar a",
  titleBold = "Ki’ichpam Xunaán?",
  addressLines = [
    "Carretera Yalcoba-Xtut,",
    "Supermanzana km 9.5, 97794",
    "Yalcobá, Yucatán",
  ],
  phone = "+52 1 998 751 0867",
  buttonLabel = "Abrir en Google Maps",
  googleMapsUrl = "https://maps.google.com/?q=Kiichpam+Xunaan",
  mapEmbedUrl = "https://www.google.com/maps?q=Kiichpam+Xunaan&z=11&output=embed",
  followUsLabel = "Síguenos en:",
  socials = DEFAULT_SOCIALS,
  routeVideos = DEFAULT_ROUTE_VIDEOS,
}: HowToArriveSectionProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteVideoItem | null>(
    null
  );
  const [videoError, setVideoError] = useState(false);
  const [isOpeningMaps, setIsOpeningMaps] = useState(false);
  const [mapsMessage, setMapsMessage] = useState<string | null>(null);

  const destinationQuery = "Kiichpam Xunaan, Yalcobá, Yucatán, México";

  const closeModal = () => {
    setSelectedRoute(null);
    setVideoError(false);
  };

  const openRouteVideo = (route: RouteVideoItem) => {
    setVideoError(false);
    setSelectedRoute(route);
  };

  const openMapsWithoutLocation = () => {
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const buildDirectionsUrl = (latitude: number, longitude: number) => {
    const origin = `${latitude},${longitude}`;
    const destination = encodeURIComponent(destinationQuery);

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  const handleOpenGoogleMaps = () => {
    setMapsMessage(null);

    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      setMapsMessage("Tu navegador no permite obtener ubicación.");
      openMapsWithoutLocation();
      return;
    }

    setIsOpeningMaps(true);
    setMapsMessage("Buscando tu ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const directionsUrl = buildDirectionsUrl(latitude, longitude);

        setIsOpeningMaps(false);
        setMapsMessage(null);

        window.open(directionsUrl, "_blank", "noopener,noreferrer");
      },
      () => {
        setIsOpeningMaps(false);
        setMapsMessage("No se pudo tomar tu ubicación. Se abrirá Maps normal.");
        openMapsWithoutLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!selectedRoute) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedRoute]);

  return (
    <>
      <section className="relative z-10 w-full bg-[#005F74] md:-mt-[80px] lg:-mt-[110px]">
        <div className="w-full overflow-hidden">
          <div className="flex flex-col lg:h-[370px] lg:flex-row">
            <div
              className="relative w-full overflow-hidden bg-[#005F74] lg:h-[370px] lg:w-[370px] lg:min-w-[370px]"
              style={{
                backgroundImage: "url('/mapa/textura.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "950px auto",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[#005F74]/72" />

              <div className="relative z-10 flex h-full flex-col justify-start px-6 pb-6 pt-9 sm:px-8 lg:px-[34px] lg:pt-[52px]">
                <div className="w-full max-w-[310px]">
                  <h2 className="leading-none text-white">
                    <span className="block text-[28px] font-light tracking-[-0.02em] lg:text-[32px]">
                      {titleLight}
                    </span>

                    <span className="mt-1 block text-[26px] font-extrabold tracking-[-0.02em] lg:text-[27px]">
                      {titleBold}
                    </span>
                  </h2>

                  <div className="mt-5">
                    {addressLines.map((line, index) => (
                      <p
                        key={`${line}-${index}`}
                        className="text-[15px] font-medium leading-[1.16] text-white lg:text-[16px]"
                      >
                        {line}
                      </p>
                    ))}

                    <p className="mt-2 text-[16px] font-extrabold leading-[1.16] text-white lg:text-[17px]">
                      {phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    disabled={isOpeningMaps}
                    className="mt-7 inline-flex h-[36px] min-w-[178px] items-center justify-center rounded-[6px] bg-[#C028B9] px-5 text-center text-[13px] font-extrabold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isOpeningMaps ? "Tomando ubicación..." : buttonLabel}
                  </button>

                  {mapsMessage && (
                    <p className="mt-2 max-w-[260px] text-[10px] font-semibold leading-snug text-white/85">
                      {mapsMessage}
                    </p>
                  )}

                  <div className="mt-4 grid w-full max-w-[300px] grid-cols-3 gap-[5px]">
                    {routeVideos.map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => openRouteVideo(route)}
                        title={route.label}
                        className="flex h-[28px] min-w-0 items-center justify-center rounded-[5px] bg-[#C028B9] px-[5px] text-center text-[9.5px] font-extrabold leading-none text-white transition hover:opacity-90"
                      >
                        <span className="block truncate">{route.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full bg-[#d9d9d9] lg:h-[370px] lg:flex-1">
              <iframe
                src={mapEmbedUrl}
                title="Mapa de ubicación de Ki’ichpam Xunaán"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="flex min-h-[138px] w-full flex-col items-center justify-center bg-[#005F74] px-4 py-6">
            <h3 className="text-center text-[28px] font-extrabold leading-none text-white lg:text-[30px]">
              {followUsLabel}
            </h3>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-5 lg:gap-6">
              {socials.map((social) => (
                <Link
                  key={social.alt}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.alt}
                  className="inline-flex h-[38px] w-[38px] items-center justify-center transition hover:scale-105 hover:opacity-90"
                >
                  <Image
                    src={social.src}
                    alt={social.alt}
                    width={38}
                    height={38}
                    className="h-[38px] w-[38px] object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedRoute && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-0 py-0 backdrop-blur-[4px] sm:px-6 sm:py-8"
          onClick={closeModal}
        >
          <div
            className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative border-b border-white/15 bg-[#005F74] px-5 py-5 sm:px-7"
              style={{
                backgroundImage: "url('/mapa/textura.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "950px auto",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[#005F74]/82" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/80">
                    Ruta en video
                  </p>

                  <h3 className="mt-1 text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">
                    {selectedRoute.label}
                  </h3>

                  <p className="mt-2 max-w-2xl text-[14px] font-medium leading-relaxed text-white/90 sm:text-[15px]">
                    {selectedRoute.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cerrar modal"
                  className="flex h-11 w-11 min-w-11 items-center justify-center bg-white text-[28px] font-light leading-none text-[#005F74] transition hover:bg-[#C028B9] hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-black sm:min-h-[480px]">
              {!videoError ? (
                <video
                  key={selectedRoute.id}
                  src={selectedRoute.src}
                  className="h-full max-h-[72vh] w-full bg-black object-contain"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                >
                  Tu navegador no soporta videos HTML5.
                </video>
              ) : (
                <div className="flex min-h-[360px] w-full flex-col items-center justify-center bg-black px-6 text-center">
                  <h4 className="text-[24px] font-extrabold text-white">
                    No se pudo cargar el video
                  </h4>

                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
                    Revisa que el archivo exista exactamente en esta ruta:
                  </p>

                  <code className="mt-4 block bg-white px-4 py-3 text-[14px] font-bold text-[#005F74]">
                    {selectedRoute.src}
                  </code>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#0B7285]">
                  Ki’ichpam Xunaán
                </p>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Video seleccionado:{" "}
                  <span className="font-extrabold text-slate-900">
                    {selectedRoute.label}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  disabled={isOpeningMaps}
                  className="inline-flex h-[42px] items-center justify-center bg-[#005F74] px-5 text-sm font-extrabold text-white transition hover:bg-[#0B7285] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isOpeningMaps ? "Tomando ubicación..." : "Abrir Google Maps"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-[42px] items-center justify-center bg-[#C028B9] px-5 text-sm font-extrabold text-white transition hover:bg-[#d637d0]"
                >
                  Cerrar video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}