import { Rubik_Mono_One } from "next/font/google";
import { PropsWithChildren } from "react";

import { Card } from "~/components/ui/card";
import { customQustionTypeToHumanReadable } from "~/lib/custom-question-type";
import { cn } from "~/lib/utils";
import { useQuestionViewMode } from "../context";

const rubikMonoOne = Rubik_Mono_One({
    weight: "400",
    subsets: ["latin"],
});

export function QuestionViewModeContainer({ children }: PropsWithChildren) {
    const { type, order, isFirst, isLast } = useQuestionViewMode();

    return (
        <div className="flex gap-4">
            <div className="relative flex w-16 shrink-0 items-center justify-center">
                <span
                    className={cn(
                        "absolute left-1/2 -z-10 h-full w-0.5 -translate-x-1/2 bg-muted-foreground",
                        isFirst && "top-1/2 h-1/2",
                        isLast && "bottom-1/2 h-1/2",
                        isFirst && isLast && "hidden",
                    )}
                />
                <span
                    className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-full bg-foreground tabular-nums text-background outline outline-4 outline-background",
                        rubikMonoOne.className,
                    )}
                >
                    {order}
                </span>
            </div>

            <div className="flex h-full w-full items-center py-2">
                <Card className="w-full p-4">
                    <p className="text-sm capitalize text-muted-foreground">
                        {customQustionTypeToHumanReadable(type)}
                    </p>

                    {children}
                </Card>
            </div>
        </div>
    );
}
