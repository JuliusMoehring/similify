"use client";

import { DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { cn } from "~/lib/utils";

const steps = [
    {
        name: "Authorize Spotify",
        pathname: "/spotify/authorize",
    },
    {
        name: "Join Session",
        pathname: "/spotify/join-session",
    },
];

export function SpotifyStepper() {
    const pathname = usePathname();

    const activeStepIndex = steps.findIndex(
        (step) => step.pathname === pathname,
    );

    return (
        <ol className="flex w-full items-center justify-between space-x-2 rounded-lg p-3 text-center text-sm font-medium @container">
            {steps.map((step, index) => (
                <Fragment key={step.pathname}>
                    <li className="flex items-center gap-2">
                        <span
                            className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                                index === activeStepIndex &&
                                    "bg-spotify text-black",
                            )}
                        >
                            {index + 1}
                        </span>

                        <span className="hidden text-muted-foreground @xs:inline">
                            {step.name}
                        </span>
                    </li>

                    {index < steps.length - 1 && (
                        <DoubleArrowRightIcon className="h-4 w-4" />
                    )}
                </Fragment>
            ))}
        </ol>
    );
}
