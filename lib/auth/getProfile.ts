// ./lib/auth/getProfile.ts

import { Profile } from '@/schemas'
import { createClient } from '@/lib/supabase/server'

export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createClient()
  if (!userId) {
    throw new Error('No user ID provided')
  }

  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

    if (error) {
      console.error('Error fetching profile:', error)
      throw new Error('Failed to fetch profile')
    }
    if (!data) {
      throw new Error('No profile found')
    }

    return data
}
