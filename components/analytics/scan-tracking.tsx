"use client";

/**
 * Anonymous shopper telemetry for the public product page. Feeds the admin
 * Analytics "Most Viewed Claims/Certifications" and "Average View Time"
 * metrics (lib/analytics.ts). Fire-and-forget by design — never blocks or
 * throws into the page.
 */

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

type ScanSession = { productId: string; sessionId: string } | null;

const ScanSessionContext = createContext<ScanSession>(null);

function sendScanEvent(payload: {
  productId: string;
  eventType: "VIEW" | "CLAIM_VIEW" | "CERTIFICATE_VIEW";
  claimId?: string;
  certificateId?: string;
  sessionId: string;
}) {
  fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export function ScanSessionProvider({
  productId,
  children,
}: {
  productId?: string;
  children: React.ReactNode;
}) {
  const sessionIdRef = useRef<string>("");
  if (!sessionIdRef.current && typeof crypto !== "undefined") {
    sessionIdRef.current = crypto.randomUUID();
  }

  const value = useMemo<ScanSession>(
    () => (productId ? { productId, sessionId: sessionIdRef.current } : null),
    [productId],
  );

  return <ScanSessionContext.Provider value={value}>{children}</ScanSessionContext.Provider>;
}

function useScanSession() {
  return useContext(ScanSessionContext);
}

export function ScanTracker() {
  const session = useScanSession();

  useEffect(() => {
    if (!session) return;

    sendScanEvent({ productId: session.productId, eventType: "VIEW", sessionId: session.sessionId });

    const mountedAt = Date.now();
    let reported = false;

    const reportDuration = () => {
      if (reported) return;
      reported = true;
      const viewDurationMs = Date.now() - mountedAt;
      const payload = JSON.stringify({
        sessionId: session.sessionId,
        productId: session.productId,
        viewDurationMs,
      });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/scan/duration", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/scan/duration", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
          () => {},
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") reportDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", reportDuration);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", reportDuration);
      reportDuration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.productId, session?.sessionId]);

  return null;
}

export function TrackInView({
  eventType,
  targetId,
  children,
}: {
  eventType: "CLAIM_VIEW" | "CERTIFICATE_VIEW";
  targetId?: string;
  children: React.ReactNode;
}) {
  const session = useScanSession();
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!session || !targetId || !ref.current) return;

    const element = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            sendScanEvent({
              productId: session.productId,
              eventType,
              claimId: eventType === "CLAIM_VIEW" ? targetId : undefined,
              certificateId: eventType === "CERTIFICATE_VIEW" ? targetId : undefined,
              sessionId: session.sessionId,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [session, eventType, targetId]);

  return <div ref={ref}>{children}</div>;
}

export function useCertificateViewTracker() {
  const session = useScanSession();

  return (certificateId: string) => {
    if (!session) return;
    sendScanEvent({
      productId: session.productId,
      eventType: "CERTIFICATE_VIEW",
      certificateId,
      sessionId: session.sessionId,
    });
  };
}
