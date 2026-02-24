// ./components/monthpicker.tsx

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { get } from "http";

interface MonthPickerProps {
    className?: string
}

const getLast12Months = () => {
    const months = [];
    const now = new Date();
  
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString();
      const label = date.toLocaleString("default", { month: "long", year: "numeric" });
      months.push({ value, label });
    }
  
    return months;
  };


  const months = getLast12Months();

  export default function MonthPicker({ className }: MonthPickerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = months[0].value;
    const selected = searchParams.get("month") ?? currentMonth;

    const handleChange = (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
        params.set("month", value);
        router.push(`?${params}`);
    };

    return (
        <>
            <Select onValueChange={handleChange} defaultValue={selected}>
                <SelectTrigger className={`w-full max-w-200 ${className}`}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )

}