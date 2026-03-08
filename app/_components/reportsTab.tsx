// ./app/_components/reportsTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import AnnualCategoryReport from "./annualCategoryReport";
import { CategoryList } from "@/schemas";

interface ReportsTabProps {
    className?: string;
    categoryList: CategoryList;
  
}

export default async function ReportsTab({ className, categoryList }: ReportsTabProps) {
    
    return (
        <TabsContent value="reports" className={className}>
            <AnnualCategoryReport className="w-full md:flex-1" categories={categoryList} />
        </TabsContent>
    );
}