export default function HomeSkeleton() {
    return (
      <main className="min-h-screen bg-[#005F73]">
        <section className="relative h-[590px] w-full overflow-hidden bg-black">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#3b1238] via-[#111111] to-[#005F73]" />
  
          <div className="absolute left-1/2 top-[190px] z-10 w-full max-w-[1100px] -translate-x-1/2 px-6 text-center">
            <div className="mx-auto h-12 w-[80%] max-w-[850px] animate-pulse rounded-full bg-white/20" />
            <div className="mx-auto mt-5 h-5 w-[70%] max-w-[700px] animate-pulse rounded-full bg-white/15" />
            <div className="mx-auto mt-3 h-5 w-[55%] max-w-[520px] animate-pulse rounded-full bg-white/15" />
            <div className="mx-auto mt-10 h-[42px] w-[205px] animate-pulse rounded-[7px] bg-[#C028B9]/70" />
          </div>
        </section>
  
        <section className="bg-[linear-gradient(180deg,#483289_0%,#005F74_100%)] px-4 py-14">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto mb-10 h-14 w-[420px] max-w-full animate-pulse rounded-full bg-white/20" />
  
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="overflow-hidden rounded-[8px] bg-white shadow-[0_14px_28px_rgba(0,0,0,0.25)]"
                >
                  <div className="h-[200px] animate-pulse bg-black/20" />
  
                  <div className="px-6 pb-5 pt-6">
                    <div className="h-8 w-[75%] animate-pulse rounded-full bg-[#C028B9]/25" />
  
                    <div className="mt-6 space-y-4">
                      {[1, 2, 3, 4, 5, 6].map((line) => (
                        <div key={line} className="flex items-start gap-3">
                          <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-[#483289]/25" />
                          <div className="h-4 flex-1 animate-pulse rounded-full bg-black/10" />
                        </div>
                      ))}
                    </div>
  
                    <div className="mt-24 h-4 w-[60%] animate-pulse rounded-full bg-black/10" />
                    <div className="mt-4 h-14 w-[65%] animate-pulse rounded-full bg-[#C028B9]/25" />
                    <div className="mt-5 h-[44px] w-full animate-pulse rounded-[7px] bg-[#C028B9]/60" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }