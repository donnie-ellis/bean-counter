'use server'

import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { Tag, UpdateTagForm, CreateTagForm, CreateTagSchema, UpdateTagSchema } from '@/schemas'

// Get all tags
export async function getTags(): Promise<Tag[]> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('tags')
        .select('id, name, user_id, created_at')
        .order('name');

    if (error) {
        console.error('Error fetching tags:', error);
        throw new Error('Failed to fetch tags');
    }

    return data
}

// Get a tag
export async function getTag(id: string): Promise<Tag> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('tags')
        .select('id, name, user_id, created_at')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching tag:', error);
        throw new Error('Failed to fetch tag');
    }

    return data
}

// Insert a tag
export async function insertTag(tag: CreateTagForm): Promise<Tag> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const validatedData = CreateTagSchema.safeParse({ ...tag, user_id: user.id });
    if (!validatedData.success) {
        console.error('Validation failed:', validatedData.error);
        throw new Error('Validation failed');
    }
    const { data, error } = await supabase
        .from('tags')
        .insert({ ...validatedData.data, user_id: user.id })
        .select()
        .single();
    if (error) {
        console.error('Error creating tag:', error);
        throw new Error('Failed to create tag');
    }
    return data;
}

// Update a tag
export async function updateTag(id: string, tag: UpdateTagForm): Promise<Tag> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const validatedData = UpdateTagSchema.safeParse({ id: id, ...tag, user_id: user.id });
    if (!validatedData.success) {
        console.error('Validation failed: ', validatedData.error)
        throw new Error('Validation failed');
    }

    const { data, error } = await supabase
        .from('tags')
        .update(validatedData.data)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Error updating tag:', error);
        throw new Error('Failed to update tag');
    }
    return data;
}

// Delete a tag
export async function deleteTag(id: string): Promise<void> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting tag:', error);
        throw new Error('Failed to delete tag');
    }
    return;
}
