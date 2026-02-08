// ./app/profile/actions.ts

'use server';

import { UpdateProfileForm, UpdateProfileSchema } from "@/schemas/profile";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export type State = {
    status: "success" | "error";
    message: string;
} | null;

export async function updateProfile(input: UpdateProfileForm): Promise<{ data: any, error: any }>{
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
        throw new Error('Authentication error');
    }
    const dataToInsert = {
        first_name: input.first_name,
        last_name: input.last_name,
        full_name: `${input.first_name} ${input.last_name}`
    }

    const validatedData = UpdateProfileSchema.safeParse(dataToInsert);

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
        .from('profiles')
        .update(validatedData.data)
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: {message: error.message } };
    }
    revalidatePath('/profile')
    return { data, error: null };
}
