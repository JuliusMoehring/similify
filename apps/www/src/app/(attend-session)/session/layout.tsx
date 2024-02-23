"use client";

import { PropsWithChildren } from "react";
import { PublicSocketProvider } from "~/contexts/public-socket";

export default function SessionLayout({ children }: PropsWithChildren) {
    return (
        <PublicSocketProvider>
            <main className="h-screen w-screen">{children}</main>
        </PublicSocketProvider>
    );
}
