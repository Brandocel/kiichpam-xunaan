import Image from "next/image";

export default function CenoteXkokay() {
  return (
    <section className="w-full bg-[#00586F] pb-16 pt-8 sm:pb-20 md:pb-24 lg:pb-28">
      <div className="mx-auto max-w-[1512px] px-5 sm:px-6 md:px-10 lg:px-[42px] xl:px-[64px]">
        <div className="relative">
          {/* IMAGEN PRINCIPAL */}
          <div className="relative h-[330px] w-full overflow-hidden rounded-[8px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px]">
            <Image
              src="/cenotepage/Cenotexkokay2.webp"
              alt="Cenote Xkokay"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />

            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.70)_100%)]" />

            <div className="absolute bottom-[18px] right-[22px] z-10 sm:bottom-[26px] sm:right-[36px] md:bottom-[34px] md:right-[56px] lg:bottom-[46px] lg:right-[150px] xl:right-[230px]">
              <h2
                className="
                  text-[42px]
                  font-black
                  leading-[0.88]
                  tracking-[-0.02em]
                  text-white
                  drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]
                  sm:text-[54px]
                  md:text-[68px]
                  lg:text-[82px]
                  xl:text-[90px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Cenote
                <br />
                Xkokay
              </h2>
            </div>
          </div>

          {/* BLOQUE INFERIOR */}
          <div className="relative">
            {/* IMAGEN SUPERPUESTA */}
            <div
              className="
                absolute
                left-[22px]
                top-[-150px]
                z-20
                hidden
                w-[390px]
                lg:block
                xl:left-[58px]
                xl:top-[-170px]
                xl:w-[500px]
              "
            >
              <div className="relative h-[410px] w-full overflow-hidden rounded-[8px] shadow-[0_24px_42px_rgba(0,0,0,0.45)] xl:h-[520px]">
                <Image
                  src="/cenotepage/estalaquita.webp"
                  alt="Estalactitas del Cenote Xkokay"
                  fill
                  className="object-cover object-center"
                  sizes="500px"
                />
              </div>
            </div>

            {/* TEXTO DERECHA */}
            <div
              className="
                relative
                z-10
                mt-8
                max-w-full
                pl-0
                sm:pl-[10px]
                md:mt-10
                md:pl-[25px]
                lg:ml-[480px]
                lg:max-w-[560px]
                lg:pt-[8px]
                xl:ml-[570px]
                xl:max-w-[620px]
                xl:pt-[18px]
              "
            >
              <h3
                className="
                  text-[22px]
                  font-black
                  leading-[1.12]
                  tracking-[-0.01em]
                  text-white
                  sm:text-[26px]
                  md:text-[30px]
                  lg:text-[31px]
                  xl:text-[34px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Un rincón escondido donde la luz se filtra suavemente entre la
                roca
              </h3>

              <p
                className="
                  mt-5
                  max-w-full
                  text-[14px]
                  font-medium
                  leading-[1.5]
                  tracking-[-0.01em]
                  text-white
                  sm:text-[15px]
                  md:mt-6
                  md:text-[16px]
                  lg:text-[16px]
                  xl:text-[18px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                El cenote Xkokay crea una atmósfera íntima y llena de misterio.
                Sus aguas tranquilas y cristalinas envuelven el momento en una
                sensación de calma absoluta, mientras la naturaleza y la energía
                ancestral del lugar convierten cada instante en algo
                profundamente especial. Un escenario perfecto para vivir
                emociones auténticas y recuerdos que perduran para siempre.
              </p>
            </div>

            <div className="hidden h-[150px] lg:block xl:h-[190px]" />

            {/* MOBILE / TABLET */}
            <div className="mt-10 block lg:hidden">
              <div className="relative h-[360px] w-full overflow-hidden rounded-[8px] shadow-[0_24px_42px_rgba(0,0,0,0.45)] sm:h-[460px] md:h-[560px]">
                <Image
                  src="/cenotepage/estalaquita.webp"
                  alt="Estalactitas del Cenote Xkokay"
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}