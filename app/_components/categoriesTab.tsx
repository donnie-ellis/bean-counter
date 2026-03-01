// ./app/_components/categoriesTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import { CategoryWithSpending } from "@/schemas";
import { CategoryBudgetCard } from "@/app/categories/_components/categoryBudgetCard";

interface CategoriesTabProps {
    className?: string,
    categories: CategoryWithSpending[];
}

export default async function CategoriesTab({ className, categories }: CategoriesTabProps) {
    return (
        <TabsContent value="categories" className={className}>
            {categories.length === 0 ? (
                <div className="text-center text-sm text-foreground/70 py-10">
                    No Categories yet, please create some to get started
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {categories.map((category: CategoryWithSpending) => (
                        <CategoryBudgetCard key={category.id} category={category} allCategories={categories} className="w-full md:flex-1" />
                    ))}
                </div>
            )
            }
        </TabsContent>
    )
}
