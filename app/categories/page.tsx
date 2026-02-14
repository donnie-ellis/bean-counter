// ./app/budget/categories/page.tsx

import CategoryAdmin from "@/app/categories/_components/categoryManager";
import { getCategories } from "@/app/categories/actions";
export default async function Categories() {

    const categories = await getCategories();
    if (!categories) {
        return <div>Loading...</div>;
    }

    return <CategoryAdmin categories={categories} />;


}