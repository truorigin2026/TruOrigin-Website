export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`verified-badge ${className}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1l1.2 2.4 2.7.4-2 1.9.5 2.7L6 7.4 3.6 8.4l.5-2.7-2-1.9 2.7-.4L6 1z"
          fill="currentColor"
        />
      </svg>
      Information
    </span>
  );
}
