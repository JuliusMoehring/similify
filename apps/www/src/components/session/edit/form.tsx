import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { InternalLinkButton } from "~/components/ui/link-button";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { SEARCH_PARAMS } from "~/lib/search-params";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import { SessionQuestionProvider } from "./context";
import { SessionQuestionCard } from "./session-questions/card";
import {
    EditQuestionsSchema,
    EditQuestionsType,
    FilledCustomQuestionsType,
} from "./types";

function constructInitialQuestions(
    questions: RouterOutputs["custom"]["getSessionQuestions"],
): EditQuestionsType {
    if (questions.length === 0) {
        return {
            questions: [
                {
                    type: null,
                    question: "",
                },
            ],
        };
    }

    return {
        questions: questions.map(({ type, question, options }) => {
            if (type === CUSTOM_QUESTION_TYPE.FREE_TEXT) {
                return {
                    type,
                    question,
                };
            }

            if (
                type === CUSTOM_QUESTION_TYPE.SINGLE_CHOICE ||
                type === CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE
            ) {
                return {
                    type,
                    question,
                    options: options.map(({ option }) => ({ option })),
                };
            }

            throw new Error(`Unknown question type: ${type}`);
        }),
    };
}

type QuestionsEditModeFormProps = {
    sessionId: string;
    questions: RouterOutputs["custom"]["getSessionQuestions"];
};

export function QuestionsEditModeForm({
    sessionId,
    questions,
}: QuestionsEditModeFormProps) {
    const utils = api.useUtils();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updatedSearchParams = new URLSearchParams(searchParams);
    updatedSearchParams.delete(SEARCH_PARAMS.EDIT_MODE);
    updatedSearchParams.sort();

    const createCustomQuestionsMutation =
        api.custom.createCustomQuestions.useMutation();

    const form = useForm<EditQuestionsType>({
        resolver: zodResolver(EditQuestionsSchema),
        defaultValues: constructInitialQuestions(questions),
    });

    const { fields, ...handlers } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const onSubmit = async ({ questions }: EditQuestionsType) => {
        await createCustomQuestionsMutation.mutateAsync({
            sessionId,
            questions: questions.filter(
                (question): question is FilledCustomQuestionsType =>
                    question.type !== null,
            ),
        });

        await utils.custom.getSessionQuestions.invalidate({ sessionId });

        toast.success("Questions saved", {
            description: "Your questions have been saved successfully.",
        });

        router.replace(`${pathname}?${updatedSearchParams.toString()}`);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <SessionQuestionProvider
                            key={field.id}
                            index={index}
                            handlers={handlers}
                            field={field}
                            control={form.control}
                        >
                            <SessionQuestionCard />
                        </SessionQuestionProvider>
                    ))}
                </div>

                <div className="flex justify-end gap-4">
                    <InternalLinkButton
                        href={`${pathname}?${updatedSearchParams.toString()}`}
                        variant="outline"
                    >
                        Cancel
                    </InternalLinkButton>

                    <Button
                        type="submit"
                        disabled={createCustomQuestionsMutation.isLoading}
                    >
                        {createCustomQuestionsMutation.isLoading
                            ? "Saving..."
                            : "Save"}
                    </Button>
                </div>

                <DevTool control={form.control} placement="top-left" />
            </form>
        </Form>
    );
}
