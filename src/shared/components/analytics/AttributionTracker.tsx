"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttributionFromCurrentUrl } from "@/shared/lib/attribution";

function AttributionRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  useEffect(() => {
    captureAttributionFromCurrentUrl();
  }, [pathname, queryString]);

  return null;
}

export function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <AttributionRouteTracker />
    </Suspense>
  );
}