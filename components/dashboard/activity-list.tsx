import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * A clean, divider-based list row for feeds that aren't tabular enough for
 * DataTable (activity/attention feeds, instructional tips) — replaces the
 * old pattern of boxing every row in its own `rounded-lg bg-muted` pill,
 * which read as a stack of disconnected cards rather than a real list.
 */
export function ActivityList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border">{children}</div>;
}

export function ActivityRow({
  title,
  detail,
  meta,
  href,
  onClick,
  unread,
}: {
  title: string;
  detail?: string;
  meta?: string;
  href?: string;
  /** Fires on click/navigate — e.g. marking a notification read. */
  onClick?: () => void;
  /** Shows a small leading dot and bolds the title — e.g. an unread notification. */
  unread?: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-start gap-2">
        {unread ? <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> : null}
        <div className="min-w-0">
          <p className={cn("truncate text-sm text-foreground", unread ? "font-semibold" : "font-medium")}>{title}</p>
          {detail ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p> : null}
        </div>
      </div>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="-mx-2 block rounded-md px-2 transition-colors hover:bg-muted/50">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="-mx-2 block w-full rounded-md px-2 text-left transition-colors hover:bg-muted/50">
        {content}
      </button>
    );
  }

  return content;
}
