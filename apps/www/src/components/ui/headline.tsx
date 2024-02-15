import { cva, VariantProps } from "class-variance-authority";
import { Rubik_Mono_One } from "next/font/google";
import { ComponentProps, createElement, forwardRef } from "react";

import { cn } from "~/lib/utils";

const headlineVariants = cva("", {
    variants: {
        size: {
            xs: "text-xl",
            s: "text-2xl",
            default: "text-3xl",
            l: "text-4xl",
            xl: "text-5xl",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

const rubikMonoOne = Rubik_Mono_One({
    weight: "400",
    subsets: ["latin"],
});

type HeadlineProps = ComponentProps<"h1"> &
    VariantProps<typeof headlineVariants> & {
        tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    };

export const Headline = forwardRef<HTMLHeadingElement, HeadlineProps>(
    ({ tag, size, className, ...props }, ref) => {
        return createElement(tag, {
            ref,
            className: cn(
                headlineVariants({ size }),
                rubikMonoOne.className,
                className,
            ),
            ...props,
        });
    },
);

Headline.displayName = "Headline";
