// ./app/actions.ts

'use server';
import { getUser } from "@/lib/auth/getUser";
import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";

export async function validateBudgetAccess() {
    const user = await getUser();
    if (!user) {
        return { data: null, error: { message: "Not authenticated" } };
    }

    const profile = await getProfile(user.id);
    if (!profile) {
        return { data: null, error: { message: "No profile found" } };
    }

    return profile.role === 'admin' || profile.role === 'user';
}

export async function getAccountBalances() {
    const supabase = await createClient();

    const { data, error } = await supabase.from('account_balances').select('*');

}