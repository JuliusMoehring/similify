"use client";

import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { api } from "~/trpc/react";
import { QuestionEditMode } from "./edit/edit-mode";
import { QuestionViewMode } from "./view/view-mode";
import { useSearchParams } from "next/navigation";
import { validateIsEditMode } from "~/lib/search-params";

type SessionQuestionsProps = {
    sessionId: string;
};

export function SessionQuestions({ sessionId }: SessionQuestionsProps) {
    const searchParams = useSearchParams();
    const isEditMode = validateIsEditMode(searchParams);

    const questionsQuery = api.custom.getSessionQuestions.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        questionsQuery,
        "Could not load questions",
        "Could not load questions",
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Questions</h3>
            </div>

            {isEditMode ? (
                <QuestionEditMode sessionId={sessionId} />
            ) : (
                <QuestionViewMode sessionId={sessionId} />
            )}
        </div>
    );
}
