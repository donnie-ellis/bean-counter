// ./app/_components/AnnualCategoryReport.tsx
'use client'
import { useEffect, useState } from "react";
import { CategoryList, CategoryWithSpending } from "@/schemas";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { getCategoriesWithBudget } from "@/app/categories/actions";
import AnnualCategoryChart from "./annualCategoryChart";
import AnnualCategoryChartSkeleton from "./annualCategoryChartSkeleton";

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

const MONTH_STARTS = getLast12MonthStarts();

export default function AnnualCategoryReport({ className = '', categories }: AnnualCategoryReportProps) {
    const [categoryData, setCategoryData] = useState<CategoryWithSpending[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ShortCategory | null>(null);

    useEffect(() => {
        if (!selectedCategory) {
            setSelectedCategory(categories[0]);
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    MONTH_STARTS.map((monthStart) => getCategoriesWithBudget(monthStart.toISOString()))
                );
                setCategoryData(results.flat());
            } catch (error) {
                console.error("Failed to fetch category data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory]);

    function handleCategoryChange(categoryId: string) {
        const found = categories.find((c) => c.id === categoryId) ?? null;
        setSelectedCategory(found);
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Annual Category Report</CardTitle>
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
                        data={categoryData}
                        monthStarts={MONTH_STARTS}
                        categoryName={selectedCategory.name}
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