import { Account, Profile } from '@/schemas'
import { logout } from '@/app/auth/logout/actions'
import { Button } from '@/components/ui/button'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Home, Building2, Shield, User, LogOut, Users, DollarSign } from 'lucide-react'


interface MainMenuProps {
    className?: string
    user?: Profile | null
    accounts?: Account[] | null
}

export default function MainMenu({ className, user, accounts }: MainMenuProps) {

    return (
        <NavigationMenu viewport={false} className={className}>
            <NavigationMenuList className='space-x-3'>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/" className='flex items-center gap-2 px-4 py-2'>
                            <Home className='h-4 w-4' />
                            <span>Home</span>
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Accounts Menu */}
                <AccountsMenu />

                {/* Admin Menu */}
                <AdminMenu />

                {/* User Menu */}
                <UserMenu />

            </NavigationMenuList>
        </NavigationMenu>
    )

    function AccountsMenu({ className }: { className?: string }) {
        if (!user) return null
        if (!accounts) return null
        return (
            <NavigationMenuItem className={className}>
                <NavigationMenuTrigger className='flex items-center gap-2'>
                    <Building2 className='h-4 w-4' />
                    Accounts
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul className='p-2 grid gap-2 md:grid-cols-2 w-100 md:w-125'>
                        {accounts.map((account) => (
                            <Item key={account.id} asChild>
                                <Link href={`/accounts/${account.id}`}>
                                    <ItemContent>
                                        <ItemTitle>{account.name}</ItemTitle>
                                        <ItemDescription>{account.institution}</ItemDescription>
                                    </ItemContent>
                                </Link>
                            </Item>
                        ))}
                        {accounts.length === 0 && <li className='px-3 py-2 text-sm text-muted-foreground'>No accounts found.</li>}
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        )
    }

    function AdminMenu({ className }: { className?: string }) {
        if (!user) return null
        if (user.role !== 'admin') return null
        return (
            <NavigationMenuItem className={className}>
                <NavigationMenuTrigger className='flex items-center gap-2'>
                    <Shield className='h-4 w-4' />
                    Admin
                </NavigationMenuTrigger>
                <NavigationMenuContent className='p-2'>
                    <ul className='flex flex-col gap-1 min-w-[250px]'>
                        <li>
                            <Item asChild>
                                <Link href="/admin/users" className='flex items-start gap-3'>
                                    <Users className='h-5 w-5 mt-0.5 flex-shrink-0' />
                                    <ItemContent>
                                        <ItemTitle>Users</ItemTitle>
                                        <ItemDescription>Manage existing or invite new users</ItemDescription>
                                    </ItemContent>
                                </Link>
                            </Item>
                        </li>
                        <li>
                            <Item asChild>
                                <Link href="/admin/budget" className='flex items-start gap-3'>
                                    <DollarSign className='h-5 w-5 mt-0.5 flex-shrink-0' />
                                    <ItemContent>
                                        <ItemTitle>Budget</ItemTitle>
                                        <ItemDescription>Setup accounts and budgets</ItemDescription>
                                    </ItemContent>
                                </Link>
                            </Item>
                        </li>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        )
    }

    function UserMenu({ className }: { className?: string }) {
        if (!user) return null
        return (
            <NavigationMenuItem className={className}>
                <NavigationMenuTrigger className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    {user.first_name} {user.last_name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className='p-2'>
                    <ul className='flex flex-col gap-1 min-w-[180px]'>
                        <li>
                            <Item asChild>
                                <Link href="/profile" className='flex items-center gap-3'>
                                    <User className='h-5 w-5 flex-shrink-0' />
                                    <ItemContent>
                                        <ItemTitle>Profile</ItemTitle>
                                    </ItemContent>
                                </Link>
                            </Item>
                        </li>
                        <li>
                            <Item asChild className='hover:bg-destructive/10 hover:text-destructive cursor-pointer'>
                                <form action={logout} className='w-full'>
                                    <button
                                        type="submit"
                                        className='w-full flex items-center gap-3 text-left transition-colors cursor-pointer'
                                    >
                                        <LogOut className='h-5 w-5 flex-shrink-0' />
                                        <ItemContent>
                                            <ItemTitle>Log Out</ItemTitle>
                                        </ItemContent>
                                    </button>
                                </form>
                            </Item>
                        </li>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        )
    }
}