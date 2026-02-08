// ./utils/supabase/getServerAuth.ts

import { createClient } from '@/lib/supabase/server'

export async function getServerAuth() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data ?? null
  }

  return { user, profile }
}
