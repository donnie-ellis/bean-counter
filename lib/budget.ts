import { BudgetWithCategory, BudgetTreeNode, BudgetPeriodSchema } from "@/schemas";

export function buildBudgetTree(budgets: BudgetWithCategory[]): BudgetTreeNode[] {
    // Step 1: Group budgets by category
    const categoryMap = new Map<string, BudgetTreeNode>();

    // Create a node for uncategorized budgets
    const uncategorizedNode: BudgetTreeNode = {
        categoryId: null,
        categoryName: "Uncategorized",
        parentId: null,
        budgets: [],
        totalAmount: 0,
        directAmount: 0,
        children: [],
    };

    // Step 2: Process all budgets and build category nodes
    budgets.forEach(budget => {
        if (!budget.category) {
            // Handle uncategorized budgets
            uncategorizedNode.budgets.push({
                id: budget.id,
                period: budget.period,
                amount: budget.amount,
            });
            uncategorizedNode.directAmount += budget.amount;
            return;
        }

        const categoryId = budget.category.id;
        const parentId = budget.category.parent?.id ?? null;

        // Create or get the category node
        if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
                categoryId: categoryId,
                categoryName: budget.category.name,
                parentId: parentId,
                budgets: [],
                totalAmount: 0,
                directAmount: 0,
                children: [],
            });
        }

        const node = categoryMap.get(categoryId)!;
        node.budgets.push({
            id: budget.id,
            period: budget.period,
            amount: budget.amount,
        });
        node.directAmount += budget.amount;

        // If this category has a parent, ensure parent exists in map
        if (parentId && budget.category.parent) {
            if (!categoryMap.has(parentId)) {
                categoryMap.set(parentId, {
                    categoryId: parentId,
                    categoryName: budget.category.parent.name,
                    parentId: null, // Parent categories are assumed to be root level
                    budgets: [],
                    totalAmount: 0,
                    directAmount: 0,
                    children: [],
                });
            }
        }
    });

    // Step 3: Build tree structure and calculate totals
    const rootNodes: BudgetTreeNode[] = [];

    // First, organize children under parents
    categoryMap.forEach(node => {
        if (node.parentId === null) {
            rootNodes.push(node);
        } else {
            const parent = categoryMap.get(node.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                // Parent not found, treat as root
                rootNodes.push(node);
            }
        }
    });

    // Sort children alphabetically
    rootNodes.forEach(node => {
        node.children.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    });

    // Step 4: Calculate total amounts (including children)
    function calculateTotalAmount(node: BudgetTreeNode): number {
        let total = node.directAmount;
        node.children.forEach(child => {
            total += calculateTotalAmount(child);
        });
        node.totalAmount = total;
        return total;
    }

    rootNodes.forEach(calculateTotalAmount);

    // Sort root nodes alphabetically
    rootNodes.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    // Add uncategorized if it has budgets
    if (uncategorizedNode.budgets.length > 0) {
        uncategorizedNode.totalAmount = uncategorizedNode.directAmount;
        rootNodes.push(uncategorizedNode);
    }

    return rootNodes;
}

/**
 * Flattens the tree for table display while maintaining hierarchy
 */
export function flattenBudgetTree(tree: BudgetTreeNode[]): Array<{
    node: BudgetTreeNode;
    level: number;
    isParent: boolean;
    hasChildren: boolean;
}> {
    const result: Array<{
        node: BudgetTreeNode;
        level: number;
        isParent: boolean;
        hasChildren: boolean;
    }> = [];

    function traverse(node: BudgetTreeNode, level: number) {
        const hasChildren = node.children.length > 0;

        result.push({
            node,
            level,
            isParent: hasChildren,
            hasChildren,
        });

        node.children.forEach(child => traverse(child, level + 1));
    }

    tree.forEach(node => traverse(node, 0));

    return result;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

/**
 * Gets the display string for a budget period
 */
export function formatBudgetPeriod(budgets: Array<{ period: string; amount: number }>): string {
    if (budgets.length === 0) return "No budgets";
    if (budgets.length === 1) return budgets[0].period;

    // Group by period
    const periods = new Set(budgets.map(b => b.period));
    if (periods.size === 1) return budgets[0].period;

    return `${budgets.length} budgets`;
}

/**
 * Gets budget count display string
 */
export function getBudgetCountDisplay(node: BudgetTreeNode): string {
    const directCount = node.budgets.length;

    if (node.children.length === 0) {
        return directCount === 1 ? "1 budget" : `${directCount} budgets`;
    }

    // Count all budgets in children
    let childCount = 0;
    function countChildren(n: BudgetTreeNode) {
        childCount += n.budgets.length;
        n.children.forEach(countChildren);
    }
    node.children.forEach(countChildren);

    const total = directCount + childCount;
    return `${total} budget${total === 1 ? '' : 's'}`;
}

export function convertBudgetTreeNodeToBudgetWithCategory(node: BudgetTreeNode): BudgetWithCategory {
    return {
        period: BudgetPeriodSchema.parse(node.budgets[0]?.period || 'monthly'),
        amount: node.budgets[0]?.amount,
        category: node.categoryId ? {
            id: node.categoryId,
            name: node.categoryName,
            parent: null,
        } : null,
        id: node.budgets[0]?.id || '',

    };
}