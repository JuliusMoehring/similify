"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
    ChevronDownIcon,
    MoonIcon,
    PencilIcon,
    SunIcon,
    SunMoonIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Headline } from "~/components/ui/headline";
import { InternalLinkButton } from "~/components/ui/link-button";
import { Separator } from "~/components/ui/separator";
import { AdminSocketProvider } from "~/contexts/admin-socket";
import { useCalculateHeight } from "~/hooks/use-calculate-height";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

type SidebarSessionLinkProps = {
    session: RouterOutputs["session"]["getSessions"][number];
};

function SidebarSessionLink({ session }: SidebarSessionLinkProps) {
    const pathname = usePathname();

    const href = `/dashboard/session/${session.id}`;

    const isActive = pathname === href;

    return (
        <InternalLinkButton
            href={href}
            variant="ghost"
            className={cn(
                "w-full justify-start",
                isActive && "bg-accent text-accent-foreground",
            )}
        >
            {session.name}
        </InternalLinkButton>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { signOut } = useClerk();
    const { user } = useUser();
    const { setTheme } = useTheme();
    const router = useRouter();

    const { ref: sidebarRef, height: sidebarHeight } = useCalculateHeight(16);

    const { ref: mainRef, height: mainHeight } = useCalculateHeight(0);

    const sessionsQuery = api.session.getSessions.useQuery();

    return (
        <AdminSocketProvider>
            <div className="flex h-screen flex-col overflow-hidden">
                <header className="flex items-center justify-between border-b border-muted px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/images/logo.png"
                            className="h-10 w-10 rounded-md outline outline-offset-2 outline-muted-foreground"
                            alt="logo"
                            width={40}
                            height={40}
                        />

                        <Headline tag="h1">similify</Headline>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 focus-within:outline-none">
                                <Avatar>
                                    <AvatarImage
                                        src={user?.imageUrl}
                                        alt={user?.username ?? "User avatar"}
                                    />
                                    <AvatarFallback>
                                        {user?.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <span>{user?.username}</span>

                                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Theme
                                    </DropdownMenuSubTrigger>

                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem
                                                className="flex items-center gap-2"
                                                onClick={() =>
                                                    setTheme("light")
                                                }
                                            >
                                                <SunIcon className="h-4 w-4" />
                                                Light
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="flex items-center gap-2"
                                                onClick={() => setTheme("dark")}
                                            >
                                                <MoonIcon className="h-4 w-4" />
                                                Dark
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="flex items-center gap-2"
                                                onClick={() =>
                                                    setTheme("system")
                                                }
                                            >
                                                <SunMoonIcon className="h-4 w-4" />
                                                System
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                <a
                                    className="h-full w-full"
                                    href="https://github.com/JuliusMoehring/similify"
                                >
                                    GitHub
                                </a>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    signOut(() => router.replace("/"))
                                }
                            >
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <div className="flex h-full">
                    <aside className="w-64 shrink-0 space-y-2 border-r border-muted px-2 py-4">
                        <InternalLinkButton
                            href={"/dashboard"}
                            className="flex w-full items-center gap-4"
                            variant="outline"
                        >
                            Create new session
                            <PencilIcon className="h-4 w-4 text-muted-foreground" />
                        </InternalLinkButton>

                        <Separator />

                        <div
                            ref={sidebarRef}
                            className="space-y-1 overflow-hidden overflow-y-scroll"
                            style={{ height: sidebarHeight }}
                        >
                            {sessionsQuery.data?.map((session) => (
                                <SidebarSessionLink
                                    key={session.id}
                                    session={session}
                                />
                            ))}
                        </div>
                    </aside>

                    <main
                        ref={mainRef}
                        className="w-full overflow-hidden overflow-y-auto p-4"
                        style={{ height: mainHeight }}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </AdminSocketProvider>
    );
}
