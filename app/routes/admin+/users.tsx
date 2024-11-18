import { TooltipContent } from '@radix-ui/react-tooltip'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import * as React from 'react'
import { Spacer } from '#app/components/spacer.tsx'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '#app/components/ui/breadcrumb.tsx'
import { PaginationBar } from '#app/components/ui/pagination-bar.tsx'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.tsx'
import { Tooltip, TooltipTrigger } from '#app/components/ui/tooltip.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc } from '#app/utils/misc.tsx'
import { requireAdmin } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAdmin(request)

	const url = new URL(request.url)
	const $top = Number(url.searchParams.get('$top')) || 10
	const $skip = Number(url.searchParams.get('$skip')) || 0

	const [users, total] = await prisma.$transaction([
		prisma.user.findMany({
			skip: $skip,
			take: $top,
			include: {
				roles: true,
				image: true,
				sessions: true,
				connections: true,
			},
		}),
		prisma.user.count(),
	])
	return json({
		pagination: {
			total,
			from: Math.min($skip + 1, total),
			to: Math.min($skip + $top, total),
		},
		total,
		users,
	})
}

export default function Users() {
	const { pagination } = useLoaderData<typeof loader>()
	return (
		<div className="w-full">
			<div className="page-header-breadcrumb flex flex-wrap items-end justify-between gap-2">
				<div>
					<Breadcrumb>
						<BreadcrumbList className="gap-1.5 sm:gap-1">
							<BreadcrumbItem>
								<Link prefetch="intent" to={`/admin`}>
									Home
								</Link>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<Link prefetch="intent" to={`/admin/users`}>
									Users
								</Link>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<Spacer size="4xs" />
					<h1 className="page-title mb-0 text-lg font-medium">Users List</h1>
				</div>
			</div>
			<Spacer size="4xs" />
			<UsersTable />
			<Spacer size="4xs" />
			<div className="flex justify-between">
				<PaginationCaption
					className="mb-sm-0 mb-2"
					from={pagination.from}
					to={pagination.to}
					total={pagination.total}
				/>
				<PaginationBar className="justify-end" total={pagination.total} />
			</div>
		</div>
	)
}

function UsersTable() {
	const { users } = useLoaderData<typeof loader>()
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead className="w-[100px]">Email</TableHead>
					<TableHead>Roles</TableHead>
					<TableHead className="w-[170px]">Created At</TableHead>
					<TableHead className="w-[170px]">Updated At</TableHead>
					<TableHead className="text-center">Sessions</TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>
							<div className="flex flex-wrap items-center">
								<Avatar className="size-10 border-2">
									<AvatarImage src={getUserImgSrc(user.image?.id)} />
									<AvatarFallback>{user.username}</AvatarFallback>
								</Avatar>
								<div className="ms-4">
									<span className="mb-0 flex items-center font-medium">
										{user.name}
									</span>
									<p className="text-textmuted dark:text-textmuted/50 mb-0 text-xs">
										{user.username}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>
							<div className="flex space-x-1">
								{user.roles.map((role) => (
									<Tooltip key={role.id}>
										<TooltipTrigger>
											<Badge>{role.name}</Badge>
										</TooltipTrigger>
										<TooltipContent>{role.description}</TooltipContent>
									</Tooltip>
								))}
							</div>
						</TableCell>
						<TableCell>
							{formatDistanceToNow(user.createdAt, {
								addSuffix: true,
							})}
						</TableCell>
						<TableCell>
							{formatDistanceToNow(user.updatedAt, {
								addSuffix: true,
							})}
						</TableCell>
						<TableCell className="text-center">
							{user.sessions.length}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

const PaginationCaption = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & { from: number; to: number; total: number }
>(({ className, from, to, total, ...props }, ref) => (
	<div className={cn('text-sm', className)} {...props} ref={ref}>
		Showing <b>{from}</b> to <b>{to}</b> of <b>{total}</b> entries
	</div>
))
