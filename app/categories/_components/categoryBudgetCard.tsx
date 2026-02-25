'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryWithSpending } from "@/schemas";
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import React from "react";

interface CategoryBudgetCardProps {
    category: CategoryWithSpending;
    allCategories: CategoryWithSpending[];
    className?: string;
}

const getColor = (name: string) =>
    `hsl(${name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`

export const CategoryBudgetCard = ({ category, allCategories, className = "" }: CategoryBudgetCardProps) => {
    const budget = category.totaled_budget || category.budget_amount || 0;
    const percentageSpent = budget !== 0 ?category.spent / budget * 100 : 0

    const color = getColor(category.name);
    const accentColor = color

    // Arc spans 280 degrees total; fill is proportional to percentage (capped at 100%)
    const MAX_ANGLE = 280;
    const filledAngle = (Math.min(percentageSpent, 100) / 100) * MAX_ANGLE;
    const startAngle = 180 + (360 - MAX_ANGLE) / 2;
    const endAngle = startAngle + filledAngle;

    const chartConfig: ChartConfig = {
        spent: {
            label: category.name,
            color: accentColor,
        },
    }

    const chartData = [{ name: category.name, spent: category.spent, fill: accentColor }]

    const parentName = category.parent_id
        ? allCategories.find((c) => c.id === category.parent_id)?.name
        : null;

    function statusVariant(p: number): "destructive" | "secondary" | "default" {
        if (p >= 100) return "destructive";
        if (p >= 85) return "secondary";
        return "default";
    }

    return (
        <Card className={className}>
            <CardContent className="p-4 flex gap-4 items-center">

                <div className="flex-1 min-w-0 space-y-2.5">

                    {/* Breadcrumb + name */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <div className="flex items-center gap-1 min-w-0">
                            {parentName && (
                                <>
                                    <span className="text-xs text-foreground/35 truncate">{parentName}</span>
                                    <span className="text-foreground/25 text-xs">›</span>
                                </>
                            )}
                            <span className="text-sm font-semibold truncate">{category.name}</span>
                        </div>
                    </div>

                    {/* Spent + Budget */}
                    <div className="flex items-baseline gap-3 font-mono text-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wide text-foreground/40 font-sans">Spent</span>
                            <span className="font-semibold" style={{ color: accentColor }}>
                                ${category.spent.toLocaleString()}
                            </span>
                        </div>
                        {budget !== 0 && (
                            <>
                                <span className="text-foreground/20 text-xs">/</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wide text-foreground/40 font-sans">Budget</span>
                                    <span className="text-foreground/60">
                                        ${budget.toLocaleString()}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Progress or no-budget */}
                    {budget !== 0 ? (
                        <div className="space-y-2">
                            <Progress
                                value={Math.min(percentageSpent, 100)}
                                className={`[&>div]:bg-(--cat-color) hover:opacity-70 ${percentageSpent >= 100 ? "border border-destructive" : ""}`}
                                style={{ "--cat-color": accentColor } as React.CSSProperties}
                            />
                            <Badge variant={statusVariant(percentageSpent)} className="text-xs">
                                {percentageSpent >= 100
                                    ? "Over budget"
                                    : percentageSpent >= 85
                                        ? `${Math.round(percentageSpent)}% used`
                                        : <><span className="opacity-60 mr-1">Remaining</span>${category.remaining?.toLocaleString()}</>
                                }
                            </Badge>
                        </div>
                    ) : (
                        <p className="text-xs text-foreground/35 italic">No budget configured</p>
                    )}
                </div>

                {/* Gauge or untracked indicator */}
                {budget !== 0 ? (
                    <ChartContainer config={chartConfig} className="w-[100px] h-[100px] flex-shrink-0">
                        <RadialBarChart
                            data={chartData}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            innerRadius="70%"
                            outerRadius="100%"
                        >
                            <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                            />
                            <RadialBar dataKey="spent" background cornerRadius={4} />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground font-bold font-mono"
                                                        fontSize={13}
                                                    >
                                                        {Math.round(percentageSpent)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy ?? 0) + 16}
                                                        className="fill-muted-foreground"
                                                        fontSize={9}
                                                    >
                                                        used
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                ) : (
                    <div
                        className="flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5"
                        style={{ background: `${color}12` }}
                    >
                        <span className="text-[10px] uppercase tracking-wide font-sans" style={{ color: `${color}99` }}>spent</span>
                        <span className="font-mono text-xs font-bold" style={{ color }}>
                            ${category.spent.toLocaleString()}
                        </span>
                    </div>
                )}

            </CardContent>
        </Card>
    );
};