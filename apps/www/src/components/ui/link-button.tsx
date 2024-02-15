import { type VariantProps } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";
import { type ComponentPropsWithoutRef, type PropsWithChildren } from "react";

import { cn } from "~/lib/utils";
import { buttonVariants } from "./button";

type ExternalLinkButtonProps = ComponentPropsWithoutRef<"a"> &
    VariantProps<typeof buttonVariants>;

export function ExternalLinkButton({
    variant,
    size,
    className,
    children,
    ...props
}: ExternalLinkButtonProps) {
    return (
        <a
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        >
            {children}
        </a>
    );
}

type InternalLinkButtonProps = ComponentPropsWithoutRef<"a"> &
    LinkProps &
    VariantProps<typeof buttonVariants>;

export function InternalLinkButton({
    variant,
    size,
    children,
    href,
    className,
    ...props
}: PropsWithChildren<InternalLinkButtonProps>) {
    return (
        <Link
            href={href}
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        >
            {children}
        </Link>
    );
}
