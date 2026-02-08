// ./app/cardholder/actions.ts

'use server'

import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { InsertCardholderSchema, UpdateCardholderSchema } from '@/schemas';
import { z } from 'zod';

/**
 * Fetch all cardholders
 */
export async function getCardholders() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  const { data, error } = await supabase
    .from('cardholders')
    .select('id, user_id, name, created_at')
    .order('name');

  if (error) {
    console.error('Error fetching cardholders:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new cardholder
 */
export async function createCardholder(formData: { user_id: string; name: string }) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate input
  const parseResult = InsertCardholderSchema.safeParse(formData);
  if (!parseResult.success) {
    throw new Error('Invalid input: ' + JSON.stringify(parseResult.error.format()));
  }

  const { data, error } = await supabase
    .from('cardholders')
    .insert([parseResult.data])
    .select()
    .single();

  if (error) {
    console.error('Error creating cardholder:', error);
    throw new Error('Failed to create cardholder');
  }

  return data;
}

/**
 * Update an existing cardholder
 */
export async function updateCardholder(id: string, formData: Partial<{ user_id: string; name: string }>) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate input
  const parseResult = UpdateCardholderSchema.safeParse(formData);
  if (!parseResult.success) {
    throw new Error('Invalid input: ' + JSON.stringify(parseResult.error.format()));
  }

  const { data, error } = await supabase
    .from('cardholders')
    .update(parseResult.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cardholder:', error);
    throw new Error('Failed to update cardholder');
  }

  return data;
}

/**
 * Delete a cardholder
 */
export async function deleteCardholder(id: string) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('cardholders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cardholder:', error);
    throw new Error('Failed to delete cardholder');
  }

  return { success: true };
}
