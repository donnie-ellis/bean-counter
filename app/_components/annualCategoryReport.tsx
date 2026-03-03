// ./app/_components/AnnualCategoryReport.tsx
'use client'
import { useEffect, useMemo, useState } from "react";
import { CategoryList, CategoryWithSpending } from "@/schemas";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { getCategoriesWithBudget } from "@/app/categories/actions";
import AnnualCategoryChart from "./annualCategoryChart";
import AnnualCategoryChartSkeleton from "./annualCategoryChartSkeleton";
import { format } from "date-fns";

interface AnnualCategoryReportProps {
    className?: string;
    categories: CategoryList;
}

type ShortCategory = {
    id: string;
    name: string;
}

function getLast12MonthStarts(): Date[] {
    const months: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
        months.push(new Date(today.getFullYear(), today.getMonth() - i, 1));
    }
    return months;
}

const monthStarts = getLast12MonthStarts();

export default function AnnualCategoryReport({ className = '', categories }: AnnualCategoryReportProps) {
    const [categoryData, setCategoryData] = useState<CategoryWithSpending[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ShortCategory | null>(null);
    const categoryMap = useMemo(
        () =>
            categoryData.reduce((map, cat) => {
                const existing = map.get(cat.id) ?? [];
                map.set(cat.id, [...existing, cat]);
                return map;
            }, new Map<string, CategoryWithSpending[]>()),
        [categoryData]
    );

    useEffect(() => {
        if (!selectedCategory) {
            setSelectedCategory(categories[0]);
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    monthStarts.map((monthStart) => getCategoriesWithBudget(monthStart.toISOString()))
                );
                setCategoryData(results.flat());
            } catch (error) {
                console.error("Failed to fetch category data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory, categories]);

    function handleCategoryChange(categoryId: string) {
        const found = categories.find((c) => c.id === categoryId) ?? null;
        setSelectedCategory(found);
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <h1 className="text-sm uppercase font-medium text-muted-foreground tracking-wide">Annual Category Report</h1>
                    <span className="text-xs text-muted-foreground tracking-wide">
                        {format(new Date(monthStarts[monthStarts.length - 1]), "MMM yyyy")} –{" "}
                        {format(new Date(monthStarts[0]), "MMM yyyy")}
                    </span>
                </CardTitle>
                <CardDescription>
                    <Select onValueChange={handleCategoryChange} value={selectedCategory?.id ?? ""}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <AnnualCategoryChartSkeleton />
                ) : categoryData.length > 0 && selectedCategory ?
                    <AnnualCategoryChart
                        data={categoryMap.get(selectedCategory.id) || []}
                        monthStarts={monthStarts}
                    /> : !selectedCategory ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Select a category to view annual spending
                        </p>
                    ) :
                        null
                }
            </CardContent>
        </Card>
    );
}