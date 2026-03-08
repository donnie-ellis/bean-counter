'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/app/transactions/_components/transactionForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Account, Category, CategoryWithSpending, CreateTransactionForm, SmallProfile } from "@/schemas";
import { insertTransaction } from "@/app/transactions/actions";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/use-media-query";

interface CreateTransactionButtonProps {
  className?: string;
  buttonText?: string | null | undefined;
  size?: "default" | "icon" | "sm" | "lg" | "xs" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
  variant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
  icon?: boolean;
  categories?: Category[] | CategoryWithSpending[];
  accounts?: Account[];
  users?: SmallProfile[];
  currentUserId?: string;
}

export function CreateTransactionButton({
  className = '',
  buttonText,
  size = 'default',
  variant = 'default',
  icon = false,
  categories = [],
  accounts = [],
  users = [],
  currentUserId = ''
}: CreateTransactionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  async function onSubmit(values: CreateTransactionForm) {
    try {
      setIsSubmitting(true);
      await insertTransaction(values);
      setIsSubmitting(false);
      toast.success("Transaction created");
      router.refresh();
      setOpen(false);
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
      setOpen(false);
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <TransactionForm
      categories={categories}
      accounts={accounts}
      users={users}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      currentUserId={currentUserId}
    />
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={className}
            >
              {buttonText || ''}
              {icon && <Plus className={`h-4 w-4 ${buttonText ? "ml-2" : ""}`} />}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }
  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
          >
            {buttonText || ''}
            {icon && <Plus className={`h-4 w-4 ${buttonText ? "ml-2" : ""}`} />}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90dvh] flex flex-col">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>Add Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto px-4 flex-1 pb-safe">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}