"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef } from "react";
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
    const handleCopy = (text: string) => {
        if (!navigator.clipboard) {
            toast.error("Clipboard API not available in this browser");
            return;
        }

        navigator.clipboard.writeText(text);

        toast.success("Copied to clipboard");
    };

    return (
        <button
            {...rest}
            type={type}
            onClick={() => handleCopy(text)}
            className={cn(buttonVariants({ size, variant }), className)}
        >
            <CopyIcon className="w-1/2 h-1/2" />

            <span className="sr-only">Copy to clipboard</span>
        </button>
    );
}
