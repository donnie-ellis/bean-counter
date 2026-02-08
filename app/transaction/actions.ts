import { getUser } from "@/lib/auth/getUser";
import { Transaction } from "@/schemas";
import { createClient } from "@/lib/supabase/server";


// Get all transactions
export async function getTransactions(): Promise<Transaction[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, user_id, account_id, cardholder_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
        .order('created_at', { ascending: false });
    if (error || !data) {
        console.error('Error retrieving transactions: ', error)
        throw new Error('Failed to retrieve transactions');
    }
    return data;
}

// Get transactions for a single account
export async function getTransactionsForAccount(accountId: string): Promise<Transaction[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, user_id, account_id, cardholder_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });
    if (error || !data) {
        console.error('Error retrieving transactions for account', error)
        throw new Error('Failed to retrieve transactions for account');
    }
    return data;
}

// Get transactionfor a single category
export async function getTransactionsForCategory(categoryId: string): Promise<Transaction[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, user_id, account_id, cardholder_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });
    if (error || !data) {
        console.error('Error getting transactions for category: ', error)
        throw new Error('Failed to get transactions for category')
    }
    return data;
}

// Get a single transaction
export async function getTransaction(id: string): Promise<Transaction> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, user_id, account_id, cardholder_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
        .eq('id', id)
        .order('created_at', { ascending: false })
        .single();
    if (error || !data) {
        console.error('Error retrieving transaction: ', error)
        throw new Error('Failed to retrieve transaction');
    }
    return data;
}

// Insert a transaction
export async function insertTransaction(transaction: Transaction): Promise<Transaction> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
    if (error || !data) {
        console.error('Error inserting transaction: ', error)
        throw new Error('Failed to insert transaction');
    }
    return data;
}

// Update a transaction
export async function updateTransaction(id: string, transaction: Transaction): Promise<Transaction> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single();
    if (error || !data) {
        console.error('Error updating transaction: ', error)
        throw new Error('Failed to update transaction');
    }
    return data;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting transaction: ', error)
        throw new Error('Failed to delete transaction');
    }
    return;
}
