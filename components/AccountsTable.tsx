import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Account } from '@/schemas'

interface AccountsTableProps {
    className?: string
    accounts: Account[]
}


export default async function AccountsTable({ className, accounts }: AccountsTableProps) {

    return (
        <div className={className}>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Accounts</CardTitle>
                    <Button
                        asChild
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                    >
                        <Link href="/budget/accounts/create">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table className={className}>
                        <TableCaption>All Accounts</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts?.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>{account.name}</TableCell>
                                    <TableCell>{account.institution}</TableCell>
                                    <TableCell>{account.type}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}