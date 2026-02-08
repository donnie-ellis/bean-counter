// ./auth/requireAuth.ts

import { getUser } from './getUser'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/auth/login')
  return user
}
