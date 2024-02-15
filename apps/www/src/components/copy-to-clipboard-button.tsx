"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { type VariantProps } from "class-variance-authority";
import { type ComponentPropsWithoutRef } from "react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { buttonVariants } from "./ui/button";

type CopyToClipboardButtonProps = ComponentPropsWithoutRef<"button"> &
    VariantProps<typeof buttonVariants> & {
        text: string;
    };

export function CopyToClipboardButton({
    type = "button",
    size = "icon",
    variant,
    text,
    className,
    ...rest
}: CopyToClipboardButtonProps) {
    const handleCopy = async (text: string) => {
        if (!navigator.clipboard) {
            toast.error("Clipboard API not available in this browser");
            return;
        }

        await navigator.clipboard.writeText(text);

        toast.success("Copied to clipboard");
    };

    return (
        <button
            {...rest}
            type={type}
            onClick={() => handleCopy(text)}
            className={cn(buttonVariants({ size, variant }), className)}
        >
            <CopyIcon className="h-4 w-4" />

            <span className="sr-only">Copy to clipboard</span>
        </button>
    );
}
