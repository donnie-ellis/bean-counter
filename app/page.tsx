import Image from "next/image";

import { requireAuth } from "@/lib/auth/requireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetCard } from "./budgets/_components/budgetCard";
import { getCategoriesWithBudget } from "./categories/actions";
import { CategoryWithBudget } from "@/schemas";
import { getProfile } from "@/lib/auth/getProfile";
export default async function Home() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  const categories = await getCategoriesWithBudget();
  if (!categories) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <main className="min-h-screen mx-auto p-6">
        <section>
            <Card>
                <CardTitle>Total</CardTitle>
                <CardContent>This is where a total component will live</CardContent>
            </Card>
          </section>
          <section>
            <Tabs defaultValue="Overview" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="budgets">Budgets</TabsTrigger>
                <TabsTrigger value="reports">Activity</TabsTrigger>
                {profile.role === "admin" && <TabsTrigger value="admin">Admin</TabsTrigger>}
              </TabsList>

              <TabsContent value="transactions" className="pt-6">
                This is where the transactions table will go
              </TabsContent>

              <TabsContent value="budgets" className="pt-6">
                { categories.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-10">
                        No budgets yet. Create a budget to see it here.
                    </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category: CategoryWithBudget) => (
                    <BudgetCard key={category.id} category={category} allCategories={categories} />
                  ))}
                </div>
              )
                }
              </TabsContent>

              <TabsContent value="reports" className="pt-6">
                This is where the reports will go
              </TabsContent>

                {profile.role === "admin" && (
                    <TabsContent value="admin" className="pt-6">
                        This is where the admin panel will go
                    </TabsContent>
                )}
            </Tabs>
          </section>
      </main>
    </>
  );
}
