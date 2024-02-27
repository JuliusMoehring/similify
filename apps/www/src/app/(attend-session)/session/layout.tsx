"use client";

import { PropsWithChildren } from "react";

export default function SessionLayout({ children }: PropsWithChildren) {
    return <main className="h-screen w-screen">{children}</main>;
}
