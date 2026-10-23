import Link from "next/link";

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
}: {
  title: string;
  detail?: string;
  meta?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {detail ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p> : null}
      </div>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="-mx-2 block rounded-md px-2 transition-colors hover:bg-muted/50">
        {content}
      </Link>
    );
  }

  return content;
}
