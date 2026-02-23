// ./app/transactions/_components/createTransactionButton.tsx

'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TransactionForm from "@/app/transactions/_components/transactionForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Account, Category, CategoryList, CreateTransactionForm, SmallProfile } from "@/schemas";
import { insertTransaction } from "@/app/transactions/actions";


interface CreateTransactionButtonProps {
    className?: string;
    buttonText?: string | null | undefined;
    size? : "icon" | "default" | "xs" | "sm" | "lg" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
    variant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    icon?: boolean;
    categories?: CategoryList;
    accounts?: Account[];
    users?: SmallProfile[];
    currentUserId?: string


};


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
        }
    };

    return (
        <>
            <Button 
                variant={variant}
                size={size}
                className={className} 
                onClick={() => setOpen(true)}
                >
                {buttonText || ''}
                {icon && <Plus className="ml-2 h-4 w-4" />}
            </Button>
            {/* Edit form */}
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogContent className="sm:max-w-md">
                    
                    <DialogHeader>
                        <DialogTitle>
                            Add Transaction
                        </DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        categories={categories}
                        accounts={accounts}
                        users={users}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        currentUserId={currentUserId}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}