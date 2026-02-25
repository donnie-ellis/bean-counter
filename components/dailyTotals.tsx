// ./components/dailyTotals.tsx

'use client'

import { Transaction } from "@/schemas";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyTotalsProps {
    className?: string;
    transactions: Transaction[];
    days?: number;
}

function buildChartData(
    transactions: Transaction[],
    days: number
): { label: string; date: Date; total: number }[] {
    const today = startOfDay(new Date());

    return Array.from({ length: days }, (_, i) => {
        const date = subDays(today, days - 1 - i);

        const total = transactions
            .filter((tx) => {
                const txDate = startOfDay(new Date(tx.occurred_at));
                return isSameDay(txDate, date);
            })
            .reduce((sum, tx) => sum + Math.max(0, tx.amount), 0); // only positive (spend)

        return {
            label: i === days - 1 ? "Today" : format(date, "EEE"),
            date,
            total: parseFloat(total.toFixed(2)),
        };
    });
}

const chartConfig = {
    total: {
        label: "Spend",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function DailyTotals({ className, transactions, days = 7 }: DailyTotalsProps) {
    const data = buildChartData(transactions, days);
    const totalSpend = data.reduce((s, d) => s + d.total, 0);
    const avgSpend = totalSpend / days;
    const todaySpend = data[data.length - 1].total;

    const formatCurrency = (value: number) =>
        `$${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex justify-between text-xs">
                    <h1 className="font-medium text-muted-foreground uppercase tracking-widest">
                        Weekly Spend
                    </h1>
                    </CardTitle>
                <CardDescription className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm">
                    <span>
                        <span className="text-foreground font-medium">
                            {formatCurrency(todaySpend)}
                        </span>{" "}
                        today
                    </span>
                    <span>
                        <span className="text-foreground font-medium">
                            {formatCurrency(totalSpend)}
                        </span>{" "}
                        last {days} days
                    </span>
                    <span>
                        <span className="text-foreground font-medium">
                            {formatCurrency(avgSpend)}
                        </span>{" "}
                        daily avg
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex gap-4 items-center">
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v) => `$${v}`}
                            width={60}
                        />
                        <ChartTooltip
                            cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value) => [
                                        formatCurrency(value as number),
                                        " Spent",
                                    ]}
                                />
                            }
                        />
                        <Bar dataKey="total" radius={8}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={
                                        index === data.length - 1
                                            ? "hsl(var(--chart-1))"        // today: primary color
                                            : "hsl(var(--chart-1) / 0.45)" // other days: muted
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}