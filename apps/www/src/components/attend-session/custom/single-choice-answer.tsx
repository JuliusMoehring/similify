import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SingleChoiceQuestionMessageType } from "socket/src/client";
import { z } from "zod";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

import { Button } from "@ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/form";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { api } from "~/trpc/react";
import { useCustomSessionAttendeeId } from "@hooks/use-custom-session-attendee-id";

const SingleChoiceAnswerFormSchema = z.object({
    answer: z.string({
        required_error: "Please select an answer",
    }),
});

type SingleChoiceAnswerFormType = z.infer<typeof SingleChoiceAnswerFormSchema>;

type SingleChoiceAnswerProps = {
    sessionId: string;
    question: SingleChoiceQuestionMessageType;
};

export function SingleChoiceAnswer({
    sessionId,
    question,
}: SingleChoiceAnswerProps) {
    const [attendeeId] = useCustomSessionAttendeeId(sessionId);

    const answerQuestionMutation =
        api.custom.answerCustomQuestion.useMutation();

    const form = useForm<SingleChoiceAnswerFormType>({
        resolver: zodResolver(SingleChoiceAnswerFormSchema),
    });

    const onSubmit = async ({ answer }: SingleChoiceAnswerFormType) => {
        if (!attendeeId) {
            return toast.error("Attendee ID is required");
        }

        try {
            await answerQuestionMutation.mutateAsync({
                sessionId,
                questionId: question.id,
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>

                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    {question.options.map(({ id, option }) => (
                                        <FormItem
                                            key={id}
                                            className="flex items-center space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <RadioGroupItem
                                                    value={option}
                                                />
                                            </FormControl>

                                            <FormLabel className="font-normal">
                                                {option}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
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
