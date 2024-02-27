import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/form";
import { Textarea } from "@ui/textarea";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useCustomSessionAttendeeId } from "@hooks/use-custom-session-attendee-id";

const FreeTextAnswerFormSchema = z.object({
    answer: z.string().min(1, {
        message: "Answer is required",
    }),
});

type FreeTextAnswerFormType = z.infer<typeof FreeTextAnswerFormSchema>;

type FreeTextAnswerProps = {
    sessionId: string;
    questionId: string;
};

export function FreeTextAnswer({ sessionId, questionId }: FreeTextAnswerProps) {
    const [attendeeId] = useCustomSessionAttendeeId(sessionId);

    const answerQuestionMutation =
        api.custom.answerCustomQuestion.useMutation();

    const form = useForm<FreeTextAnswerFormType>({
        resolver: zodResolver(FreeTextAnswerFormSchema),
        defaultValues: {
            answer: "",
        },
    });

    const onSubmit = async ({ answer }: FreeTextAnswerFormType) => {
        if (!attendeeId) {
            return toast.error("Attendee ID is required");
        }

        try {
            await answerQuestionMutation.mutateAsync({
                sessionId,
                questionId,
                attendeeId,
                answer,
            });
        } catch (error) {
            console.error(error);

            if (error instanceof TRPCClientError) {
                return toast.error("Failed to submit answer", {
                    description: error.message,
                });
            }

            toast.error("Failed to submit answer");
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>

                            <FormControl>
                                <Textarea
                                    placeholder="Your answer to the question"
                                    rows={3}
                                    spellCheck={false}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={answerQuestionMutation.isLoading}
                    >
                        Submit Answer
                    </Button>
                </div>
            </form>
        </Form>
    );
}
