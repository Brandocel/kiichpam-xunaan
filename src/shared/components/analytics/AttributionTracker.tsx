"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttributionFromCurrentUrl } from "@/shared/lib/attribution";
import { captureAgentFromCurrentUrl } from "@/shared/lib/agent-attribution";

function AttributionRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  useEffect(() => {
    captureAttributionFromCurrentUrl();
    captureAgentFromCurrentUrl();
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