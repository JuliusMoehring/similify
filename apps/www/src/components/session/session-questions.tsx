"use client";

import { useSearchParams } from "next/navigation";

import { validateIsEditMode } from "~/lib/search-params";
import { QuestionEditMode } from "./edit/edit-mode";
import { QuestionViewMode } from "./view/view-mode";

type SessionQuestionsProps = {
    sessionId: string;
};

export function SessionQuestions({ sessionId }: SessionQuestionsProps) {
    const searchParams = useSearchParams();
    const isEditMode = validateIsEditMode(searchParams);

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
