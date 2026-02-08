// ./app/accounts/actions.ts

'use server';
import { createClient } from "@/lib/supabase/server";
import { InsertAccountSchema, type CreateAccountForm } from "@/schemas";
import { validateBudgetAccess } from "@/app/actions";

export async function getAccounts(): Promise<{ data: any, error: any }> {
    const accessValid = await validateBudgetAccess();
    if (!accessValid) {
        return { data: null, error: { message: "Access denied" } };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, institution, credit_limit, is_active, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error retrieving accounts: ', error)
    }

    return { data, error };
}
// Select a single account
export async function getAccount(id: string): Promise<{ data: any, error: any }> {
    const accessValid = await validateBudgetAccess();
    if (!accessValid) {
        return { data: null, error: { message: "Access denied" } };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, institution, credit_limit, is_active, created_at')
        .eq('id', id)
        .order('created_at', { ascending: false })
        .single();

    if (error) {
        console.error('Error retrieving accounts: ', error)
    }

    return { data, error };
}

export async function insertAccount(input: CreateAccountForm): Promise<{ data: any, error: any }> {
    const accessValid = await validateBudgetAccess();
    if (!accessValid) {
        return { data: null, error: { message: "Access denied" } };
    }
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: { message: "Not authenticated" } };
    }

    // Prepare data for insertion - convert empty strings to null
    const dataToInsert = {
        name: input.name,
        type: input.type,
        user_id: user.id,
        institution: input.institution || null,
        credit_limit: input.credit_limit ?? null,
        is_active: input.is_active ?? true,
    };

    // Validate with full schema (includes user_id and refine rules)
    const validatedData = InsertAccountSchema.safeParse(dataToInsert);

    if (!validatedData.success) {
        return {
            data: null,
            error: {
                message: "Validation failed",
                fields: validatedData.error.flatten().fieldErrors
            }
        };
    }

    const { data, error } = await supabase
        .from('accounts')
        .insert(validatedData.data)

    if (error) {
        console.error('Error inserting account:', error);
        return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
}