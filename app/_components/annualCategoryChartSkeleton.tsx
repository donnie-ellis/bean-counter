// ./app/_components/AnnualCategoryChartSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function AnnualCategoryChartSkeleton() {
  const bars = [65, 80, 45, 90, 55, 70, 85, 40, 75, 60, 95, 50];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Chart area */}
      <div className="h-64 w-full rounded-md border bg-muted/20 p-4">
        <div className="flex h-full items-end justify-between gap-1.5">
          {bars.map((height, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
              {/* Budget bar (background) */}
              <div className="relative w-full">
                <Skeleton
                  className="w-full rounded-sm opacity-40"
                  style={{ height: `${height * 0.85}px` }}
                />
                {/* Spent bar overlaid */}
                <Skeleton
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] rounded-sm"
                  style={{ height: `${height * 0.7}px` }}
                />
              </div>
              {/* X-axis label */}
              <Skeleton className="h-2.5 w-full max-w-[32px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {["Avg Spent", "Avg Budget", "Months Over"].map((label) => (
          <div key={label} className="rounded-md border bg-muted/40 px-3 py-2 text-center space-y-1.5">
            <Skeleton className="h-2.5 w-16 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}