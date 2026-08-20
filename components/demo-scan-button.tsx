"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sampleProducts } from "@/lib/data/site-data";

function toProductPath(rawValue: string) {
  const matchingProduct = sampleProducts.find(
    (product) => product.scanCode === rawValue || product.slug === rawValue,
  );

  return matchingProduct ? `/product/${matchingProduct.slug}` : null;
}

export function DemoScanButton({
  label = "Product Scan",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [scannerState, setScannerState] = useState<
    "idle" | "starting" | "ready" | "unsupported" | "denied" | "found"
  >("idle");
  const [message, setMessage] = useState(
    "Open the camera for a live product scan, or use one of the ready-made product codes below.",
  );

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const scanFrame = async () => {
    const detectorCtor = (window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => {
        detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
      };
    }).BarcodeDetector;

    if (!detectorCtor || !videoRef.current) {
      setScannerState("unsupported");
      setMessage(
        "Live QR detection is not supported in this browser, so you can use the instant product scan buttons below.",
      );
      return;
    }

    try {
      const detector = new detectorCtor({ formats: ["qr_code"] });
      const codes = await detector.detect(videoRef.current);
      const nextPath = codes
        .map((code) => code.rawValue)
        .filter(Boolean)
        .map((value) => toProductPath(value as string))
        .find(Boolean);

      if (nextPath) {
        setScannerState("found");
        setMessage("QR detected. Opening the product claim page.");
        stopScanner();
        router.push(nextPath);
        setOpen(false);
        return;
      }
    } catch {
      setMessage("Camera is open, but the QR could not be decoded yet.");
    }

    frameRef.current = requestAnimationFrame(() => {
      void scanFrame();
    });
  };

  const startScanner = async () => {
    setScannerState("starting");
    setMessage("Requesting camera access for the product scanner.");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setScannerState("unsupported");
      setMessage(
        "Camera access is not available here, so the product scan buttons are ready below.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerState("ready");
      setMessage("Camera is live. Hold a QR code in view or use a product code below.");
      void scanFrame();
    } catch {
      setScannerState("denied");
      setMessage("Camera permission was blocked, so you can continue with the instant product scan.");
    }
  };

  const closeModal = () => {
    stopScanner();
    setOpen(false);
    setScannerState("idle");
    setMessage("Open the camera for a live product scan, or use one of the ready-made product codes below.");
  };

  const openModal = () => {
    setOpen(true);
    setScannerState("idle");
    setMessage("Open the camera for a live product scan, or use one of the ready-made product codes below.");
  };

  return (
    <>
      <button type="button" onClick={openModal} className={className}>
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#102317]/45 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-[32px] border border-white/65 bg-[#f7f4ed] p-5 shadow-[0_30px_120px_rgba(15,32,22,0.28)] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="eyebrow">Product Scan</p>
                <h2 className="display-font mt-5 text-3xl md:text-5xl">
                  Scan a QR and open the claim page.
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] px-5 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-[color:var(--line)] bg-[#133326] p-4 text-white md:p-5">
                <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/35">
                  <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover" />
                </div>
                <p className="mt-4 text-sm leading-7 text-white/78">{message}</p>
                <button
                  type="button"
                  onClick={() => {
                    void startScanner();
                  }}
                  className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--brand-dark)]"
                >
                  {scannerState === "ready" ? "Restart Camera" : "Open Camera"}
                </button>
              </div>

              <div className="space-y-4">
                {sampleProducts.map((product) => (
                  <button
                    key={product.slug}
                    type="button"
                    onClick={() => {
                      stopScanner();
                      setOpen(false);
                      router.push(`/product/${product.slug}`);
                    }}
                    className="w-full rounded-[28px] border border-[color:var(--line)] bg-white/82 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(16,35,23,0.08)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {product.scanCode}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{product.productNote}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
