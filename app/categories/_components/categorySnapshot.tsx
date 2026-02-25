'use client'
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryWithSpending } from "@/schemas";
import { Pie, PieChart, Label } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

interface CategorySnapshotProps {
    categories: CategoryWithSpending[];
    className?: string;
    month?: Date;
}

const getColor = (name: string) =>
    `hsl(${name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`

export default function CategorySnapshot({ categories, className = "", month = new Date() }: CategorySnapshotProps) {
    const totalBudget = categories.reduce((acc, c) => acc + (c.budget_amount ?? 0), 0);
    const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
    const overCount = categories.filter(c => c.budget_amount && c.spent > c.budget_amount).length;

    const chartConfig = categories.reduce((config, category, index) => {
        config[`category_${index}`] = {
            label: category.name,
            color: getColor(category.name),
        }
        return config
    }, {} as ChartConfig)

    const chartData = categories.map((category, index) => ({
        ...category,
        fill: `var(--color-category_${index})`,
    }))

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                    {month.toLocaleString('default', { month: 'long' })} Snapshot
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
                <div className="flex items-center gap-6">
                    {/* Donut chart */}
                    <ChartContainer
                        config={chartConfig}
                        className="h-[180px] w-[180px] flex-shrink-0"
                    >
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie
                                data={chartData}
                                dataKey="spent"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={2}
                                stroke="none"
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-base font-bold font-mono">
                                                        ${totalSpent.toLocaleString()}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground" fontSize={10}>
                                                        of ${totalBudget.toLocaleString()}
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    {/* Category list */}
                    <div className="flex-1 space-y-2 min-w-0">
                        {categories.map((category) => {
                            const pct = category.budget_amount
                                ? Math.round((category.spent / category.budget_amount) * 100)
                                : null
                            const over = category.budget_amount && category.spent > category.budget_amount
                            return (
                                <div key={category.id} className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div
                                            className="w-2 h-2 rounded-sm flex-shrink-0"
                                            style={{ background: getColor(category.name) }}
                                        />
                                        <span className="flex-1 truncate">{category.name}</span>
                                        <span className={`font-mono text-xs ${over ? "text-destructive font-semibold" : ""}`}>
                                            ${category.spent.toLocaleString()}
                                            {category.budget_amount ? ` / $${category.budget_amount.toLocaleString()}` : ""}
                                        </span>
                                    </div>
                                    {pct !== null && (
                                        <Progress
                                            value={Math.min(pct, 100)}
                                            className={`[&>div]:bg-(--color-category) hover:opacity-70 ${over ? "border border-destructive" : ""}`}
                                            style={{ "--color-category": getColor(category.name) } as React.CSSProperties}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>

            {overCount > 0 && (
                <CardFooter className="flex items-center justify-between pt-4">
                    <span className="text-xs text-muted-foreground">
                        {overCount} budget{overCount > 1 ? "s" : ""} over limit
                    </span>
                    <Badge variant="destructive">Action needed</Badge>
                </CardFooter>
            )}
        </Card>
    )
}