const WAVE_PATH =
  "M0,70 Q50,52 100,70 Q150,88 200,70 Q250,52 300,70 Q350,88 400,70 Q450,52 500,70 Q550,88 600,70 Q650,52 700,70 Q750,88 800,70 Q850,52 900,70 Q950,88 1000,70 Q1050,52 1100,70 Q1150,88 1200,70 Q1250,52 1300,70 Q1350,88 1400,70 Q1450,52 1500,70 Q1550,88 1600,70 L1600,120 L0,120 Z";

/** Seamlessly-looping wave bands (two layered tracks, opposite direction/speed). Reused on the gateway hero and the brand login panel. */
export function FlowingWaves({ className = "" }: { className?: string }) {
  return (
    <div className={`flowing-waves ${className}`.trim()} aria-hidden="true">
      <div className="wave-track wave-track-back">
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none" className="wave-shape">
          <path d={WAVE_PATH} />
        </svg>
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none" className="wave-shape">
          <path d={WAVE_PATH} />
        </svg>
      </div>
      <div className="wave-track wave-track-front">
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none" className="wave-shape">
          <path d={WAVE_PATH} />
        </svg>
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none" className="wave-shape">
          <path d={WAVE_PATH} />
        </svg>
      </div>
    </div>
  );
}
