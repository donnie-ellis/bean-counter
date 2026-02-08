// ./app/profile/page.tsx

import { getUser } from '@/lib/auth/getUser'
import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { UpdateProfileForm } from '@/app/profile/profile_form'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/auth/login')
   
  return <UpdateProfileForm profile={profile} />
}

