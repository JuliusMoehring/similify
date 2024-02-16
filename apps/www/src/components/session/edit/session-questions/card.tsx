import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useSessionQuestion } from "../context";
import { SessionQuestionChoices } from "./choices";
import { SessionQuestionQuestion } from "./question";
import { SessionQuestionType } from "./type";

export function SessionQuestionCard() {
    const { index: questionIndex, handlers } = useSessionQuestion();

    const handleAddQuestion = () => {
        handlers.insert(questionIndex + 1, {
            type: null,
            question: "",
        });
    };

    const handleRemoveQuestion = () => {
        handlers.remove(questionIndex);
    };

    return (
        <>
            <Card className="space-y-4 p-4">
                <SessionQuestionType />

                <SessionQuestionQuestion />

                <SessionQuestionChoices />

                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveQuestion}
                        disabled={questionIndex === 0}
                    >
                        <TrashIcon className="h-4 w-4" />
                        Remove Question
                    </Button>
                </div>
            </Card>

            <div className="flex justify-center">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={handleAddQuestion}
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Question
                </Button>
            </div>
        </>
    );
}
