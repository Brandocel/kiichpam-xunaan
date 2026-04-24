import Image from "next/image";

export default function CenoteYunChen() {
  return (
    <section className="w-full bg-[#00586F] pb-8 pt-10 sm:pb-10 md:pb-12 lg:pb-14">
      <div className="mx-auto max-w-[1512px] px-5 sm:px-6 md:px-10 lg:px-[42px] xl:px-[64px]">
        <div className="relative">
          {/* IMAGEN PRINCIPAL */}
          <div className="relative h-[320px] w-full overflow-hidden rounded-[8px] sm:h-[400px] md:h-[480px] lg:h-[520px] xl:h-[580px]">
            <Image
              src="/cenotepage/cenoteyun.webp"
              alt="Cenote Yun Chen"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />

            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)]" />

            <div className="absolute bottom-[20px] left-[20px] sm:left-[30px] md:left-[50px] lg:left-[70px] xl:left-[90px]">
              <h2
                className="
                  text-[42px]
                  font-black
                  leading-[0.9]
                  text-white
                  sm:text-[52px]
                  md:text-[64px]
                  lg:text-[72px]
                  xl:text-[82px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Cenote
                <br />
                Yun Chen
              </h2>
            </div>
          </div>

          {/* BLOQUE INFERIOR */}
          <div className="relative">
            {/* IMAGEN SUPERPUESTA */}
            <div
              className="
                absolute
                right-[20px]
                top-[-150px]
                z-20
                hidden
                w-[390px]
                lg:block
                xl:right-[80px]
                xl:top-[-170px]
                xl:w-[500px]
              "
            >
              <div className="relative h-[410px] w-full overflow-hidden rounded-[8px] shadow-[0_24px_42px_rgba(0,0,0,0.45)] xl:h-[520px]">
                <Image
                  src="/cenotepage/cenoteyun2.webp"
                  alt="Vista Cenote Yun Chen"
                  fill
                  className="object-cover object-center"
                  sizes="500px"
                />
              </div>
            </div>

            {/* TEXTO */}
            <div
              className="
                relative
                z-10
                mt-8
                max-w-full
                sm:mt-10
                md:mt-12
                lg:ml-[40px]
                lg:max-w-[600px]
                lg:pt-[10px]
                xl:max-w-[640px]
                xl:pt-[15px]
              "
            >
              <h3
                className="
                  text-[22px]
                  font-black
                  leading-[1.1]
                  text-white
                  sm:text-[24px]
                  md:text-[28px]
                  lg:text-[30px]
                  xl:text-[32px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Cenote semiabierto tipo caverna
              </h3>

              <p
                className="
                  mt-4
                  text-[13px]
                  font-medium
                  leading-[1.45]
                  text-white
                  sm:text-[14px]
                  md:text-[15px]
                  lg:text-[16px]
                  xl:text-[17px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                El cenote Yun Chen está caracterizado por su formación rocosa y
                entrada de luz natural desde la parte superior. Cuenta con un
                diámetro aproximado de 20 a 25 metros y una profundidad que
                alcanza entre 8 y 12 metros, con aguas cristalinas de tonalidad
                turquesa. Sus paredes de piedra caliza y formaciones naturales
                crean un entorno íntimo y visualmente impactante, ideal para
                experiencias únicas en contacto con la naturaleza.
              </p>
            </div>

            <div className="hidden h-[95px] lg:block xl:h-[120px]" />

            {/* MOBILE */}
            <div className="mt-8 block lg:hidden">
              <div className="relative h-[360px] w-full overflow-hidden rounded-[8px] shadow-[0_24px_42px_rgba(0,0,0,0.45)] sm:h-[460px] md:h-[560px]">
                <Image
                  src="/cenotepage/cenoteyun2.webp"
                  alt="Vista Cenote Yun Chen"
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