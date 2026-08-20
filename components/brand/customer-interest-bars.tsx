import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type InterestRow = { label: string; count: number };

export function CustomerInterestBars({ rows }: { rows: InterestRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Interest</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No interaction data yet.</p>
        ) : (
          rows.map((row) => {
            const pct = Math.round((row.count / total) * 100);
            return (
              <div key={row.label} className="grid gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
