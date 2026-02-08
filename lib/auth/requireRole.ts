// ./lib/auth/requireRole.ts

import { getUser } from './getUser'
import { getProfile } from './getProfile'
import { redirect } from 'next/navigation'

export async function requireRole(role: string) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)

  if (!profile || profile.role !== role && profile.role !== 'admin') {
    redirect('/403') // forbidden page
  }

  return { user, profile }
}
