import { Card } from "~/components/ui/card";
import { useQuestionViewMode } from "../context";
import { cn } from "~/lib/utils";
import { customQustionTypeToHumanReadable } from "~/lib/custom-question-type";
import { Rubik_Mono_One } from "next/font/google";
import { PropsWithChildren } from "react";

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
                        "bg-muted-foreground absolute left-1/2 -z-10 h-full w-0.5 -translate-x-1/2",
                        isFirst && "top-1/2 h-1/2",
                        isLast && "bottom-1/2 h-1/2",
                        isFirst && isLast && "hidden",
                    )}
                />
                <span
                    className={cn(
                        "bg-foreground text-background outline-background inline-flex h-12 w-12 items-center justify-center rounded-full tabular-nums outline outline-4",
                        rubikMonoOne.className,
                    )}
                >
                    {order}
                </span>
            </div>

            <div className="flex h-full w-full items-center py-2">
                <Card className="w-full p-4">
                    <p className="text-muted-foreground text-sm capitalize">
                        {customQustionTypeToHumanReadable(type)}
                    </p>

                    {children}
                </Card>
            </div>
        </div>
    );
}
