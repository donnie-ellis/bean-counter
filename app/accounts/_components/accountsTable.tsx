// ./app/accounts/_components/AccountsTable.tsx

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Account } from '@/schemas'

interface AccountsTableProps {
    className?: string
    accounts?: Account[] | null
    onEdit?: (account: Account) => void
    onDelete?: (account: Account) => void
}


export default function AccountsTable({
    className,
    accounts,
    onEdit,
    onDelete
}: AccountsTableProps) {

    return (
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
                                    <DropdownMenuItem onClick={() => onEdit && onEdit(account)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete && onDelete(account)}>
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
    )
}