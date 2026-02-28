// ./app/admin/_components/adminMenu.tsx

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
  } from "@/components/ui/navigation-menu"
import Link from "next/link";

  interface AdminMenuProps {
    className?: string;
  }
  export default function AdminMenu({ className }: AdminMenuProps) {
    return (
        <NavigationMenu className={`${className}`}>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Admin Portal</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink asChild>
                            <Link href="/">Home</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <Link href="/admin/users">Users</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <Link href="/admin/budget">Budget</Link>
                        </NavigationMenuLink>
                    </NavigationMenuContent>
                    </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
  }
  