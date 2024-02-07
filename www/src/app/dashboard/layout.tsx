"use client";

import { RedirectToSignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

type SidebarSessionLinkProps = {
    session: RouterOutputs["session"]["getSessions"][number];
};

function SidebarSessionLink({ session }: SidebarSessionLinkProps) {
    const pathname = usePathname();

    const href = `/dashboard/session/${session.id}`;

    const isActive = pathname === href;

    return (
        <li key={session.id}>
            <Link
                href={href}
                className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                    isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
            >
                {session.name}
            </Link>
        </li>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn, user, isLoaded } = useUser();

    const sessionsQuery = api.session.getSessions.useQuery();

    return (
        <>
            <SignedIn>
                <div>
                    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
                            <div className="flex h-24 shrink-0 items-center">
                                <Image
                                    className="w-12 h-12 rounded-lg"
                                    src="/images/logo.png"
                                    alt="similify"
                                    width={48}
                                    height={48}
                                />
                            </div>

                            <nav className="flex flex-1 flex-col">
                                <ul
                                    role="list"
                                    className="flex flex-1 flex-col gap-y-7"
                                >
                                    <li>
                                        {sessionsQuery.data?.map((session) => (
                                            <SidebarSessionLink
                                                key={session.id}
                                                session={session}
                                            />
                                        ))}
                                    </li>

                                    <li className="-mx-6 mt-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex w-full items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800 focus-within:outline-none">
                                                    <img
                                                        className="h-8 w-8 rounded-full bg-gray-800"
                                                        src={user?.imageUrl}
                                                        alt=""
                                                    />

                                                    <span aria-hidden="true">
                                                        {user?.username}
                                                    </span>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>
                                                    My Account
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        Profile
                                                        <DropdownMenuShortcut>
                                                            ⇧⌘P
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Billing
                                                        <DropdownMenuShortcut>
                                                            ⌘B
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Settings
                                                        <DropdownMenuShortcut>
                                                            ⌘S
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Keyboard shortcuts
                                                        <DropdownMenuShortcut>
                                                            ⌘K
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        Team
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            Invite users
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem>
                                                                    Email
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    Message
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    More...
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem>
                                                        New Team
                                                        <DropdownMenuShortcut>
                                                            ⌘+T
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    GitHub
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Support
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled>
                                                    API
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    Log out
                                                    <DropdownMenuShortcut>
                                                        ⇧⌘Q
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <HamburgerMenuIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                            />
                        </button>
                        <div className="flex-1 text-sm font-semibold leading-6 text-white">
                            Dashboard
                        </div>
                        <a href="#">
                            <span className="sr-only">Your profile</span>
                            <img
                                className="h-8 w-8 rounded-full bg-gray-800"
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt=""
                            />
                        </a>
                    </div>

                    <main className="py-10 lg:pl-72">
                        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                    </main>
                </div>
            </SignedIn>

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
