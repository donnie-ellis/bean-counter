// ./app/admin/users/actions.ts

'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Send an invite to a user
export async function inviteUser(email: string): Promise<{error: string | null}> {
    const supabase = await createServiceClient();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
        console.error('Error inviting user:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    return { error: null };
}

// Ban managment for a user
export async function setBanDuration(userId: string, seconds: number): Promise<{error: string | null}> {
    const supabase = await createServiceClient();
    const { error } = await supabase.rpc('admin_set_ban', {user_id: userId, seconds });
    if (error) {
        console.error('Error disabling user:', error);
        return {
            error: error.message
        };
    }
    revalidatePath('/admin/users');
    return {error: null}
}

// Get all users
export async function getUserProfiles(): Promise<{ data: any[] | null; error: string | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_users');

    if (error) {
        console.error('Error fetching user profiles:', error);
        return { data: null, error: 'Failed to fetch user profiles' };
    }

    return { data, error: null };
}

// Set a user role
export async function setUserRole(userId: string, role: string): Promise<{ error: string | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
    
        if (error) {
            console.error('Error setting user role:', error);
            return { error: error.message };
        }
    
        revalidatePath('/admin/users');
        return { error: null };
}
