'use server'
import { getUser } from "@/lib/auth/getUser";
import { CreateTransactionForm, PaginatedTransactions, Transaction, CreateTransactionSchema } from "@/schemas";
import { createClient } from "@/lib/supabase/server";

export interface TransactionQueryParams {
    page: number
    pageSize: number
    sortBy?: keyof Transaction
    sortOrder?: "asc" | "desc"
    search?: string
    account_id?: string
  }

// Get all transactions
export async function getTransactions({
    page,
    pageSize,
    sortBy = "created_at",
    sortOrder = "desc",
    search,
    account_id
  }: TransactionQueryParams): Promise<PaginatedTransactions> {
    const user = await getUser()
    if (!user) throw new Error("Not authenticated")
  
    const supabase = await createClient()
  
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
  
    let query = supabase
      .from("transactions")
      .select(
        `
          id,
          created_at,
          user_id,
          account_id,
          member_id,
          direction,
          amount,
          description,
          merchant,
          category_id,
          occurred_at,
          is_pending,
          notes,
          raw_data
        `,
        { count: "exact" }
      )
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to)
  
    if (search) {
      query = query.or(
        `description.ilike.%${search}%,merchant.ilike.%${search}%`
      )
    }

    if (account_id) {
      query = query.eq('account_id', account_id)
    }
  
    const { data, error, count } = await query
  
    if (error || !data) {
      console.error("Error retrieving transactions:", error)
      throw new Error("Failed to retrieve transactions")
    }
  
    return {
      data,
      count: count ?? 0,
    }
  }

  export async function getTransactionsByMonth(date: Date): Promise<Transaction[]> {
    const user = await getUser()
    if (!user) throw new Error("Not authenticated")
  
    const supabase = await createClient()
  
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString()
  
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        created_at,
        user_id,
        account_id,
        member_id,
        direction,
        amount,
        description,
        merchant,
        category_id,
        occurred_at,
        is_pending,
        notes,
        raw_data
      `)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: false })
  
    if (error || !data) {
      console.error("Error retrieving transactions by month:", error)
      throw new Error("Failed to retrieve transactions by month")
    }
  
    return data
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
        .select('id, created_at, user_id, account_id, member_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
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
        .select('id, created_at, user_id, account_id, member_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
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
        .select('id, created_at, user_id, account_id, member_id, direction, amount, description, merchant, category_id, occurred_at, is_pending, notes, raw_data')
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
export async function insertTransaction(transaction: CreateTransactionForm): Promise<Transaction> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();

    //Validate the form data
    const validatedInput = CreateTransactionSchema.safeParse({ ...transaction, user_id: user.id });
    if (!validatedInput.success) {
        console.error('Validation failed: ', validatedInput.error)
        throw new Error('Validation failed');
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert(validatedInput.data)
        .select()
        .single();
    if (error || !data) {
        console.error('Error inserting transaction: ', error)
        throw new Error('Failed to insert transaction');
    }
    return data;
}

// Update a transaction
export async function updateTransaction(id: string, transaction: CreateTransactionForm): Promise<Transaction> {
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
    return data as Transaction;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<string> {
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
    return id;
}
