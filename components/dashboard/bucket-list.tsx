import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BucketList({ title, buckets }: { title: string; buckets: { key: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2.5">
        {buckets.length > 0 ? (
          buckets.map((bucket) => (
            <div key={bucket.key} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{bucket.key}</p>
              <Badge variant="outline">{bucket.count}</Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
