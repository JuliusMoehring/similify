"use client";

import { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { QuestionMessageType } from "socket/src/client";
import { Card, CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { CircularCountdown } from "../circular-countdown";
import { cn } from "~/lib/utils";

type AnswerContainerProps = ComponentPropsWithoutRef<"div"> & {
    message: QuestionMessageType;
};

export function AnswerContainer({
    message,
    className,
    children,
    ...props
}: PropsWithChildren<AnswerContainerProps>) {
    const { question, secondsToNextQuestion } = message;

    return (
        <Card className={cn("space-y-4 p-4", className)} {...props}>
            <div className="flex justify-between gap-4">
                <div className="space-y-2">
                    <CardDescription>
                        {question.order}. Question
                    </CardDescription>

                    <CardTitle>{question.question}</CardTitle>
                </div>

                <CircularCountdown
                    seconds={secondsToNextQuestion}
                    dependencies={[question]}
                    className="h-14 w-14 shrink-0"
                />
            </div>

            {children}
        </Card>
    );
}
