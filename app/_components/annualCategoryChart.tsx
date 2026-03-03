// ./app/_components/AnnualCategoryChart.tsx
'use client'
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { CategoryWithSpending } from "@/schemas";
import { format } from "date-fns";

interface AnnualCategoryChartProps {
    data: CategoryWithSpending[];
    monthStarts: Date[]; // parallel array — same order as data
    categoryName?: string;
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
    categoryName = '',
}: AnnualCategoryChartProps) {
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

    const maxValue = Math.max(...chartData.map((d) => Math.max(d.budget, d.spent)));

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                    12-Month Spending — <span className="text-foreground font-semibold">{categoryName}</span>
                </h3>
                <span className="text-xs text-muted-foreground">
                    {format(new Date(monthStarts[monthStarts.length - 1]), "MMM yyyy")} –{" "}
                    {format(new Date(monthStarts[0]), "MMM yyyy")}
                </span>
            </div>

            <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={chartData} barGap={2} barCategoryGap="25%">
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
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        domain={[0, maxValue * 1.1]}
                    />
                    <Tooltip
                        content={
                            <ChartTooltipContent
                                formatter={(value, name) => [
                                    formatCurrency(value as number),
                                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                                ]}
                            />
                        }
                    />
                    <ChartLegend content={<ChartLegendContent />} />

                    {/* Budget line bars (muted, background) */}
                    <Bar dataKey="budget" name="budget_amount" radius={[3, 3, 0, 0]} maxBarSize={28}>
                        {chartData.map((entry, i) => (
                            <Cell
                                key={i}
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.25}
                            />
                        ))}
                    </Bar>

                    {/* Spent bars — red if over budget */}
                    <Bar dataKey="spent" name="spent" radius={[3, 3, 0, 0]} maxBarSize={28}>
                        {chartData.map((entry, i) => (
                            <Cell
                                key={i}
                                fill={entry.overBudget ? "hsl(var(--destructive))" : "hsl(var(--chart-2))"}
                                fillOpacity={0.9}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                {(
                    [
                        {
                            label: "Avg Spent",
                            value: chartData.reduce((s, d) => s + d.spent, 0) / chartData.length,
                            muted: false,
                        },
                        {
                            label: "Avg Budget",
                            value: chartData.reduce((s, d) => s + d.budget, 0) / chartData.length,
                            muted: true,
                        },
                        {
                            label: "Months Over",
                            value: chartData.filter((d) => d.overBudget).length,
                            isCount: true,
                            danger: chartData.filter((d) => d.overBudget).length > 0,
                        },
                    ] as const
                ).map(({ label, value, muted, isCount, danger }) => (
                    <div key={label} className="rounded-md border bg-muted/40 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p
                            className={`text-base font-semibold tabular-nums ${danger ? "text-destructive" : muted ? "text-muted-foreground" : "text-foreground"
                                }`}
                        >
                            {isCount ? value : formatCurrency(value)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}