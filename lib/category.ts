import { Category, CategoryWithSpending } from "@/schemas"

interface CategoryNode extends Omit<Category, 'created_at'> {
    children?: CategoryNode[]
}

export function buildTree(categories: Category[] | CategoryWithSpending[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    categories.forEach(c => {
        const { created_at, ...rest } = c as Category
        map.set(c.id, { ...rest, children: [] })
    })
    map.forEach(cat => {
        if (cat.parent_id) {
            map.get(cat.parent_id)?.children?.push(cat)
        } else {
            roots.push(cat)
        }
    })

    return roots
}
