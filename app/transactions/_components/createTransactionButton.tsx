'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import TransactionForm from "@/app/transactions/_components/transactionForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Account, Category, CategoryWithSpending, CreateTransactionForm, SmallProfile } from "@/schemas";
import { insertTransaction } from "@/app/transactions/actions";

interface CreateTransactionButtonProps {
  className?: string;
  buttonText?: string | null | undefined;
  size?: "icon" | "default" | "xs" | "sm" | "lg" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {buttonText || ''}
        {icon && <Plus className={`h-4 w-4 ${buttonText ? "ml-2" : ""}`} />}
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen} dismissible={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add Transaction</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto flex-1 px-4 pb-8">
              {formContent}
            </div>
            <Button
              variant="outline"
              className="mx-4 mb-4"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}