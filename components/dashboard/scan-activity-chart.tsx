"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Area, CartesianGrid, ComposedChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DailyScanCount } from "@/lib/analytics";

const chartConfig = {
  scans: {
    label: "QR Scans",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ScanActivityChart({ data }: { data: DailyScanCount[] }) {
  // Recharts caches gradient/stroke color resolution and doesn't redraw
  // when a CSS variable it depends on changes without a resize or remount
  // (a live theme toggle leaves the chart blank until reload) — force a
  // remount on theme change via `key`. The remount has to happen *after*
  // next-themes actually applies the .dark class to <html> (a layout
  // effect outside this component), so key off a state value updated one
  // tick later rather than the theme value directly — otherwise the
  // remount can race the class mutation and bake in the old colors.
  const { resolvedTheme } = useTheme();
  const [chartKey, setChartKey] = useState("initial");
  useEffect(() => {
    if (!resolvedTheme) return;
    const id = requestAnimationFrame(() => setChartKey(resolvedTheme));
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Scan Activity</CardTitle>
        <CardDescription>QR scans over the last {data.length} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer key={chartKey} config={chartConfig} className="aspect-auto h-64 w-full">
          <ComposedChart data={data} margin={{ top: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-scans)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-scans)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-40"
                  indicator="line"
                  labelFormatter={(value) => new Date(String(value)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                />
              }
            />
            <Area
              dataKey="scans"
              type="natural"
              fill="url(#fillScans)"
              stroke="var(--color-scans)"
              strokeWidth={1.5}
              dot={false}
              fillOpacity={1}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
