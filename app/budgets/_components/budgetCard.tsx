import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import GaugeRing from "@/components/guageRing";
import { CategoryWithBudget } from "@/schemas";

interface BudgetCardProps {
  category: CategoryWithBudget;
  allCategories: CategoryWithBudget[];
}

export const BudgetCard = ({ category, allCategories }: BudgetCardProps) => {
  const hasBudget = !!category.budget_amount && category.budget_amount !== 0;
  const p = hasBudget ? (category.spent / category.budget_amount) * 100 : 0;

  const parentName = category.parent_id
    ? allCategories.find((c) => c.id === category.parent_id)?.name
    : null;

  function statusVariant(p: number): "destructive" | "secondary" | "default" {
    if (p >= 100) return "destructive";
    if (p >= 85) return "secondary";
    return "default";
  }

  const color = `hsl(${
    category.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  }, 70%, 50%)`;

  const accentColor = p >= 100 ? "#ef4444" : p >= 85 ? "#f59e0b" : color;
  const progressBg = p >= 100 ? "bg-red-500" : p >= 85 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <Card>
      <CardContent className="p-4 flex gap-4 items-center">

        <div className="flex-1 min-w-0 space-y-2.5">

          {/* Breadcrumb + name */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
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
            {hasBudget && (
              <>
                <span className="text-foreground/20 text-xs">/</span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-foreground/40 font-sans">Budget</span>
                  <span className="text-foreground/60">
                    ${category.budget_amount.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Progress or no-budget */}
          {hasBudget ? (
            <div className="space-y-2">
              <Progress
                value={Math.min(p, 100)}
                className={`h-1.5 [&>div]:${progressBg}`}
              />
              <Badge variant={statusVariant(p)} className="text-xs">
                {p >= 100
                  ? "Over budget"
                  : p >= 85
                  ? `${Math.round(p)}% used`
                  : <><span className="opacity-60 mr-1">Remaining</span>${category.remaining?.toLocaleString()}</>
                }
              </Badge>
            </div>
          ) : (
            <p className="text-xs text-foreground/35 italic">No budget configured</p>
          )}
        </div>

        {/* Gauge or untracked indicator */}
        {hasBudget ? (
          <div className="relative flex-shrink-0">
            <GaugeRing pct={p} color={color} size={64} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 6 }}>
              <span className="font-mono text-[11px] font-bold" style={{ color: accentColor }}>
                {Math.round(p)}%
              </span>
            </div>
          </div>
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