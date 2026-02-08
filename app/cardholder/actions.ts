'use server'

import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { Cardholder, CreateCardholderSchema, UpdateCardholderSchema } from '@/schemas';
import { z } from 'zod';

// Get all cardholders
export async function getCardholders(): Promise<Cardholder[]> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('cardholders')
    .select('id, user_id, name, created_at')
    .order('name');

  if (error) {
    console.error('Error fetching cardholders:', error);
    throw new Error('Failed to fetch cardholders');
  }

  return data;
}

// Insert a cardholder
export async function insertCardholder(formData: { user_id: string; name: string }) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate input
  const validatedData = CreateCardholderSchema.safeParse(formData);
  if (!validatedData.success) {
    throw new Error('Invalid input: ' + JSON.stringify(validatedData.error.format()));
  }

  const { data, error } = await supabase
    .from('cardholders')
    .insert([validatedData.data])
    .select()
    .single();

  if (error) {
    console.error('Error creating cardholder:', error);
    throw new Error('Failed to create cardholder');
  }

  return data;
}

// Update a cardholder
export async function updateCardholder(id: string, formData: Partial<{ user_id: string; name: string }>) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const validatedData = UpdateCardholderSchema.safeParse(formData);
  if (!validatedData.success) {
    throw new Error('Invalid input: ' + JSON.stringify(validatedData.error.format()));
  }

  const { data, error } = await supabase
    .from('cardholders')
    .update(validatedData.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cardholder:', error);
    throw new Error('Failed to update cardholder');
  }

  return data;
}

// Delete a cardholder
export async function deleteCardholder(id: string): Promise<void> {
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

  return;
}
