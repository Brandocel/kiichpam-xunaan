"use client";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return (
    <div
      className={[
        "animate-pulse bg-slate-200/80",
        className,
      ].join(" ")}
    />
  );
}

function SkeletonLine({
  width = "w-full",
  height = "h-3",
}: {
  width?: string;
  height?: string;
}) {
  return <SkeletonBlock className={`${height} ${width}`} />;
}

function SkeletonInput() {
  return (
    <div>
      <SkeletonLine width="w-20" height="h-3" />
      <SkeletonBlock className="mt-2 h-10 w-full border border-slate-200 bg-slate-200/70" />
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="border border-slate-200 bg-white px-4 py-3">
      <SkeletonLine width="w-24" height="h-3" />
      <SkeletonBlock className="mt-3 h-6 w-14" />
    </div>
  );
}

export function ReservationsSectionSkeleton() {
  return (
    <section className="space-y-5">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div className="w-full max-w-xl">
              <SkeletonBlock className="h-3 w-36 bg-white/20" />
              <SkeletonBlock className="mt-4 h-9 w-64 bg-white/20" />
              <SkeletonBlock className="mt-4 h-4 w-full max-w-lg bg-white/15" />
              <SkeletonBlock className="mt-2 h-4 w-4/5 bg-white/15" />
            </div>

            <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 xl:max-w-xl">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="border border-white/10 bg-white/5 px-4 py-3"
                >
                  <SkeletonBlock className="h-3 w-20 bg-white/20" />
                  <SkeletonBlock className="mt-3 h-6 w-10 bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonInput key={index} />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SkeletonBlock className="h-10 w-full border border-slate-200 bg-slate-200 sm:w-24" />
            <SkeletonBlock className="h-10 w-full border border-slate-200 bg-slate-300 sm:w-24" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatCard key={index} />
        ))}
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center">
          <div>
            <SkeletonLine width="w-48" height="h-5" />
            <SkeletonLine width="w-72" height="mt-3 h-3" />
          </div>

          <SkeletonBlock className="h-10 w-28 border border-slate-200 bg-slate-200" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-200 bg-slate-100">
              <tr>
                {[
                  "Reservación",
                  "Cliente",
                  "Visita",
                  "Pax",
                  "Estado",
                  "Total",
                  "Acciones",
                ].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              <ReservationTableSkeletonRows rows={8} />
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center">
          <SkeletonLine width="w-52" height="h-4" />

          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24 border border-slate-200 bg-slate-200" />
            <SkeletonBlock className="h-9 w-24 border border-slate-200 bg-slate-200" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReservationTableSkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-l-4 border-l-slate-200">
          <td className="whitespace-nowrap px-4 py-4">
            <SkeletonLine width="w-36" height="h-4" />
            <SkeletonLine width="mt-2 w-20" height="h-3" />
          </td>

          <td className="px-4 py-4">
            <SkeletonLine width="w-44" height="h-4" />
            <SkeletonLine width="mt-2 w-56" height="h-3" />
            <SkeletonLine width="mt-2 w-32" height="h-3" />
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            <SkeletonLine width="w-28" height="h-4" />
            <SkeletonLine width="mt-2 w-24" height="h-3" />
          </td>

          <td className="whitespace-nowrap px-4 py-4 text-center">
            <div className="flex justify-center">
              <SkeletonBlock className="h-8 w-10 border border-slate-200 bg-slate-200" />
            </div>
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            <SkeletonBlock className="h-7 w-24 border border-slate-200 bg-slate-200" />
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            <div className="flex justify-end">
              <SkeletonLine width="w-24" height="h-4" />
            </div>
          </td>

          <td className="whitespace-nowrap px-4 py-4">
            <div className="flex justify-end gap-2">
              <SkeletonBlock className="h-8 w-20 border border-slate-200 bg-slate-200" />
              <SkeletonBlock className="h-8 w-16 border border-slate-200 bg-slate-200" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function LifecycleTreeSkeleton() {
  return (
    <div className="space-y-5">
      <section className="border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div className="w-full max-w-2xl">
            <SkeletonLine width="w-32" height="h-3" />
            <SkeletonLine width="mt-4 w-64" height="h-7" />
            <SkeletonLine width="mt-4 w-full" height="h-4" />
            <SkeletonLine width="mt-2 w-4/5" height="h-4" />
          </div>

          <div className="border border-slate-200 bg-slate-50 px-4 py-3">
            <SkeletonLine width="w-20" height="h-3" />
            <SkeletonLine width="mt-3 w-16" height="h-8" />
          </div>
        </div>

        <SkeletonBlock className="mt-5 h-2 w-full bg-slate-200" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <SkeletonLine width="w-44" height="h-3" />
          <SkeletonLine width="w-36" height="h-3" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatCard key={index} />
        ))}
      </section>

      <section className="border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <SkeletonLine width="w-28" height="h-3" />
            <SkeletonLine width="mt-3 w-72" height="h-6" />
          </div>

          <SkeletonBlock className="h-7 w-20 border border-slate-200 bg-slate-200" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="relative pl-10">
              {index < 6 && (
                <span className="absolute left-[12px] top-8 h-[calc(100%+8px)] w-[2px] bg-slate-200" />
              )}

              <SkeletonBlock className="absolute left-0 top-2 h-6 w-6 rounded-full bg-slate-300" />

              <div className="border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <SkeletonLine width="w-48" height="h-4" />
                      <SkeletonBlock className="h-6 w-20 border border-slate-200 bg-slate-200" />
                    </div>

                    <SkeletonLine width="mt-3 w-full" height="h-3" />
                    <SkeletonLine width="mt-2 w-4/5" height="h-3" />
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <SkeletonBlock className="h-7 w-36 border border-slate-200 bg-slate-200" />
                    <SkeletonBlock className="h-8 w-8 border border-slate-200 bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}