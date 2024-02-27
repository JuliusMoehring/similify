"use client";

import { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { QuestionMessageType } from "socket/src/client";
import { Card, CardDescription, CardTitle } from "@ui/card";

import { cn } from "~/lib/utils";

type AnswerContainerProps = ComponentPropsWithoutRef<"div"> & {
    message: QuestionMessageType | null;
};

export function AnswerContainer({
    message,
    className,
    children,
    ...props
}: PropsWithChildren<AnswerContainerProps>) {
    if (!message) {
        return null;
    }

    const { question } = message;

    return (
        <Card className={cn("space-y-4 p-4", className)} {...props}>
            <div className="flex justify-between gap-4">
                <div className="space-y-2">
                    <CardDescription>
                        {question.order}. Question
                    </CardDescription>

                    <CardTitle>{question.question}</CardTitle>
                </div>
            </div>

            {children}
        </Card>
    );
}
