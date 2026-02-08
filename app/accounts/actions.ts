'use server';
import { createClient } from "@/lib/supabase/server";
import { Account, CreateAccountSchema, UpdateAccountSchema, type CreateAccountForm } from "@/schemas";
import { getUser } from "@/lib/auth/getUser";

// Select all accounts
export async function getAccounts(): Promise<Account[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, institution, credit_limit, is_active, created_at, user_id')
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('Error retrieving accounts: ', error)
        throw new Error('Failed to retrieve accounts');
    }

    return data;
}
// Select a single account
export async function getAccount(id: string): Promise<Account> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, institution, credit_limit, is_active, created_at, user_id')
        .eq('id', id)
        .order('created_at', { ascending: false })
        .single();

    if (error) {
        console.error('Error retrieving accounts: ', error)
        throw new Error('Failed to retrieve accounts');
    }

    return data;
}

// Insert a new account
export async function insertAccount(input: CreateAccountForm): Promise<Account> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const validatedData = CreateAccountSchema.safeParse({ ...input, user_id: user.id });

    if (!validatedData.success) {
        console.error('Validation failed:', validatedData.error);
        throw new Error('Validation failed');
    }

    const { data, error } = await supabase
        .from('accounts')
        .insert(validatedData.data)
        .select()
        .single();

    if (error) {
        console.error('Error inserting account:', error);
        throw new Error('Failed to insert account');
    }

    return data;
}

// Update an account
export async function updateAccount(id: string, input: CreateAccountForm): Promise<Account> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const validatedData = UpdateAccountSchema.safeParse({ ...input, user_id: user.id });
    if (!validatedData.success) {
        console.error('Validation failed: ', validatedData.error);
        throw new Error('Validation failed');
    }

    const { data, error } = await supabase
        .from('accounts')
        .update(validatedData.data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating account:', error);
        throw new Error('Failed to update account');
    }

    return data;
}

// Delete an account
export async function deleteAccount(id: string): Promise<void> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting account:', error);
        throw new Error('Failed to delete account');
    }
    return;
}
