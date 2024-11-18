import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu'
import { Form, Link, useMatches, useSubmit } from '@remix-run/react'
import { ChevronUp } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '#app/components/ui/sidebar'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser, useUser } from '#app/utils/user.ts'
import type { BreadcrumbHandle } from '#app/routes/settings+/profile.tsx'
import type { SEOHandle } from '@nasa-gcn/remix-seo'

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: <Icon name="dots-horizontal">Users</Icon>,
	getSitemapEntries: () => null,
}

export function AppSidebar() {
	const user = useOptionalUser()
	const matches = useMatches()
	const isUsersPage = !!matches.find((m) => m.id === 'routes/admin+/users')

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarGroup>
					<SidebarGroupLabel>Remix Administration</SidebarGroupLabel>
				</SidebarGroup>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{user && (
								<SidebarMenuItem>
									<SidebarMenuButton isActive={isUsersPage} asChild>
										<Link prefetch="intent" to={`/admin/users`}>
											<Icon className="text-body-md" name="avatar">
												Users
											</Icon>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						{user ? (
							<UserDropdown />
						) : (
							<Button asChild variant="default" size="lg">
								<Link to="/login">Log In</Link>
							</Button>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={(e) => e.preventDefault()}
						className="flex w-full gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="mr-auto text-body-sm font-bold">
							{user.name ?? user.username}
						</span>
						<ChevronUp />
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side="top"
				className="w-[--radix-popper-anchor-width]"
			>
				<Link prefetch="intent" to={`/users/${user.username}`} autoFocus>
					<DropdownMenuItem>
						<Icon className="text-body-md" name="avatar">
							Profile
						</Icon>
					</DropdownMenuItem>
				</Link>
				<DropdownMenuItem
					// this prevents the menu from closing before the form submission is completed
					onSelect={(event) => {
						event.preventDefault()
						submit(formRef.current)
					}}
				>
					<Form action="/logout" method="POST" ref={formRef}>
						<Icon className="text-body-md" name="exit">
							<button type="submit">Logout</button>
						</Icon>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
