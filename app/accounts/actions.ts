'use server';
import { createClient } from "@/lib/supabase/server";
import { Account,
    CreateAccountSchema,
    UpdateAccountMemberSchema,
    UpdateAccountSchema,
    type CreateAccountForm,
    CreateAccountMemberSchema,
    CreateAccountFormSchema,
    AccountRoleSchema,
    AccountWithMembers,
    AccountMember
} from "@/schemas";
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
export async function insertAccount(input: CreateAccountForm): Promise<AccountWithMembers> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();
    
    // Validate the form data
    const validatedInput = CreateAccountFormSchema.safeParse(input);
    if (!validatedInput.success) {
        console.error('Validation failed:', validatedInput.error);
        throw new Error('Validation failed');
    }
    
    // Extract account member IDs and prepare account data for insertion
    const { account_members, ...accountData } = validatedInput.data;
    const validatedData = CreateAccountSchema.safeParse({ ...accountData, user_id: user.id });
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
    
    let insertedMembers: Array<{ id: string; user_id: string; role: string }> = [];
    
    // Insert account members
    if (account_members && account_members.length > 0) {
        const accountMembers = account_members.map(m => ({
            account_id: data.id as string,
            user_id: m.user_id as string,
            role: m.role, // Use the role from the form
        }));
        
        const validatedMembers = accountMembers.map((member) => {
            const result = CreateAccountMemberSchema.safeParse(member);
            if (!result.success) {
                console.error('Validation failed for account member:', result.error);
                throw new Error('Validation failed for account member');
            }
            return result.data;
        });
        
        const { data: membersData, error: membersError } = await supabase
            .from('account_members')
            .insert(validatedMembers)
            .select('id, user_id, role');
        
        if (membersError) {
            console.error('Error inserting account members:', membersError);
            throw new Error('Failed to insert account members');
        }
        
        insertedMembers = membersData || [];
    }
    
    return {
        ...data,
        account_members: insertedMembers,
    };
}

// Update an account
export async function updateAccount(id: string, input: CreateAccountForm): Promise<AccountWithMembers> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const supabase = await createClient();
    
    // Validate the form data
    const validatedInput = CreateAccountFormSchema.safeParse(input);
    if (!validatedInput.success) {
        console.error('Validation failed:', validatedInput.error);
        throw new Error('Validation failed');
    }
    
    // Extract account member IDs and prepare account data for insertion
    const { account_members, ...accountData } = validatedInput.data;
    const validatedAccount = UpdateAccountSchema.safeParse({ ...accountData, user_id: user.id });
    if (!validatedAccount.success) {
        console.error('Validation failed:', validatedAccount.error);
        throw new Error('Validation failed');
    }
    
    const { data, error } = await supabase
        .from('accounts')
        .update(validatedAccount.data)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating account:', error);
        throw new Error('Failed to update account');
    }
    
    // Delete all existing account members for this account
    const { error: deleteError } = await supabase
        .from('account_members')
        .delete()
        .eq('account_id', data.id);
    
    if (deleteError) {
        console.error('Error deleting account members:', deleteError);
        throw new Error('Failed to delete account members');
    }
    
    // Insert new account members
    if (account_members && account_members.length > 0) {
        const accountMembers = account_members.map(m => ({
            account_id: data.id as string,
            user_id: m.user_id as string,
            role: m.role, // Use the role from the form, not hardcoded 'editor'
        }));
        
        const validatedMembers = accountMembers.map((member) => {
            const result = CreateAccountMemberSchema.safeParse(member);
            if (!result.success) {
                console.error('Validation failed for account member:', result.error);
                throw new Error('Validation failed for account member');
            }
            return result.data;
        });
        
        const { error: membersError } = await supabase
            .from('account_members')
            .insert(validatedMembers);
        
        if (membersError) {
            console.error('Error inserting account members:', membersError);
            throw new Error('Failed to insert account members');
        }
    }
    
    return { account_members, ...data };
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

export async function getAccountMembers(account_id: string): Promise<AccountMember[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('account_members')
        .select('id, account_id, user_id, role, created_at')
        .eq('account_id', account_id);

    if (error) {
        console.error('Error retrieving account members: ', error)
        throw new Error('Failed to retrieve account members');
    }

    return data;
}

export async function getAllAccountsWithMembers(): Promise<AccountWithMembers[]> {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select(`
            id, name, type, institution, credit_limit, is_active, created_at, user_id,
            account_members (
                user_id, role
            )
        `)
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('Error retrieving accounts with members: ', error)
        throw new Error('Failed to retrieve accounts with members');
    }

    return data;
}