// ./app/_components/AnnualCategoryChart.tsx
'use client'
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceLine,
} from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    ChartTooltip,
} from "@/components/ui/chart";
import { CategoryWithSpending } from "@/schemas";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

interface AnnualCategoryChartProps {
    data: CategoryWithSpending[]
    monthStarts: Date[];
}

const chartConfig = {
    budget_amount: {
        label: "Budget",
        color: "hsl(var(--chart-1))",
    },
    spent: {
        label: "Spent",
        color: "hsl(var(--chart-2))",
    },
    remaining: {
        label: "Remaining",
        color: "hsl(var(--chart-3))",
    },
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AnnualCategoryChart({
    data,
    monthStarts,
}: AnnualCategoryChartProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!data?.length || !monthStarts?.length) return null;

    const chartData = monthStarts
        .map((monthStart, i) => {
            const entry = data[i];
            if (!entry) return null;
            return {
                month: format(new Date(monthStart), "MMM yy"),
                budget: entry.budget_amount,
                spent: entry.spent,
                remaining: entry.remaining,
                overBudget: entry.spent > entry.budget_amount,
            };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .reverse();

    const visibleData = isMobile ? chartData.slice(-6) : chartData;
    const highestValue = Math.max(...visibleData.map((d) => Math.max(d.budget * 1.5, d.spent)));
    const maxValue = Math.ceil(highestValue / 100) * 100;
    const avgSpent = visibleData.reduce((s, d) => s + d.spent, 0) / visibleData.length;

    return (
        <div className="space-y-2">

            <ChartContainer config={chartConfig} className="h-64 w-full min-h-[250px]">
                <BarChart data={visibleData} barGap={2} barCategoryGap="40%">
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${v.toLocaleString()}`}
                        domain={[0, maxValue]}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                formatter={(value, name) => [
                                    formatCurrency(value as number),
                                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                                ]}
                            />
                        }
                    />

                    {/* Single spent bar */}
                    <Bar dataKey="spent" name="spent" radius={[8, 8, 0, 0]} />

                    {/* Dashed budget line across each bar's x position */}
                    <ReferenceLine
                        y={chartData[0]?.budget}
                        stroke="hsl(var(--chart-1))"
                        strokeDasharray="6 3"
                        strokeWidth={2}
                        label={{
                            value: `Budget: ${formatCurrency(chartData[0]?.budget ?? 0)}`,
                            position: "insideTopRight",
                            fontSize: 11,
                            fill: "hsl(var(--chart-3))",
                        }}
                    />
                    <ReferenceLine
                        y={avgSpent}
                        stroke="hsl(var(--chart-4))"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        strokeOpacity={0.8}
                        label={{
                            value: `Avg ${formatCurrency(avgSpent)}`,
                            position: "insideBottomLeft",
                            fontSize: 11,
                            fill: "hsl(var(--chart-4))",
                        }}
                    />
                </BarChart>
            </ChartContainer>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <Item className="rounded-md border bg-muted/40 px-3 py-2 text-center">
                    <ItemTitle className="text-xs uppercase tracking-wide text-muted-foreground">Avg Spent</ItemTitle>
                    <ItemContent>
                        <ItemDescription
                            className={`text-base font-semibold tabular-nums text-muted-foreground`}>
                            {formatCurrency(chartData.reduce((s, d) => s + d.spent, 0) / chartData.length)}
                        </ItemDescription>
                    </ItemContent>
                </Item>

                <Item className="rounded-md border bg-muted/40 px-3 py-2 text-center">
                    <ItemTitle className="text-xs uppercase tracking-wide text-muted-foreground">Budget</ItemTitle>
                    <ItemContent>
                        <ItemDescription
                            className={`text-base font-semibold tabular-nums text-muted-foreground`}>
                            {formatCurrency(chartData.reduce((s, d) => s + d.budget, 0) / chartData.length)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item className="rounded-md border bg-muted/40 px-3 py-2 text-center">
                    <ItemTitle className="text-xs uppercase tracking-wide text-muted-foreground">Months Over</ItemTitle>
                    <ItemContent>
                        <ItemDescription
                            className={`text-base font-semibold tabular-nums text-destructive`}>
                            {formatCurrency(chartData.filter((d) => d.overBudget).length)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </div>
        </div>
    );
}