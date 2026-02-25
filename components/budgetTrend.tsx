// ./app/budgets/_components/budgetTrend.tsx

'use client'

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface BudgetTrendProps {
    totalBudget: number;
    totalSpent: number;
    month?: Date;
    className?: string;
}

const SPENT_COLOR = "#06b6d4"
const BUDGET_COLOR = "#94a3b8"

const chartConfig = {
    spent: {
        label: "Spent",
        color: SPENT_COLOR
    },
    budget: {
        label: "Budget pace",
        color: BUDGET_COLOR,
    },
};


export default function BudgetTrend({ totalBudget, totalSpent, month = new Date(), className = "" }: BudgetTrendProps) {

    const { data, today, daysInMonth } = useMemo(() => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const today = month.getDate();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        const dailySpend = totalSpent / today;
        const dailyBudget = totalBudget / daysInMonth;
        const data = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return {
                day,
                spent: day <= today ? parseFloat((dailySpend * day).toFixed(2)) : null,
                budget: parseFloat((dailyBudget * day).toFixed(2)),
            }
        });

        return { data, today, daysInMonth };
    }, [totalBudget, totalSpent, month]);


    const paceAtToday = parseFloat(
        ((totalBudget / daysInMonth) * today).toFixed(2)
    );

    const isUnder = totalSpent <= paceAtToday;

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase tracking-widest">
                        {month.toLocaleString('default',  {month: 'long'})} Progress
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1.5 text-xs font-normal">
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ background: SPENT_COLOR }}
                            />
                            Spent
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 text-xs font-normal">
                            <svg width="14" height="8" className="shrink-0">
                                <line
                                    x1="0"
                                    y1="4"
                                    x2="14"
                                    y2="4"
                                    stroke={BUDGET_COLOR}
                                    strokeWidth="2"
                                    strokeDasharray="3 2"
                                />
                            </svg>
                            Budget pace
                        </Badge>
                        <Badge variant={isUnder ? "secondary" : "destructive"}>
                            {isUnder ? "Under budget" : "Over budget"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="h-[110px] w-full">
                    <LineChart
                        data={data}
                        margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                    >
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            ticks={[1, 7, 14, today]}
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis hide domain={[0, totalBudget]} />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) =>
                                        value != null ? `$${Number(value).toLocaleString()}` : null
                                    }
                                />
                            }
                        />

                        {/* Budget pace — dashed */}
                        <Line
                            type="linear"
                            dataKey="budget"
                            stroke="var(--color-budget)"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />

                        {/* Spent — solid */}
                        <Line
                            type="linear"
                            dataKey="spent"
                            stroke="var(--color-spent)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}