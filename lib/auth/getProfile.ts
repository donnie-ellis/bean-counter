// ./lib/auth/getProfile.ts

import { Profile } from '@/schemas'
import { createClient } from '@/lib/supabase/server'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
}
