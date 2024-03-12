import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomSessionAttendeeId } from "@hooks/use-custom-session-attendee-id";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/form";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { MultipleChoiceQuestionMessageType } from "socket/src/client";
import { toast } from "sonner";
import { z } from "zod";

import { usePublicSocket } from "~/contexts/public-socket";

const MultipleChoiceAnswerFormSchema = z.object({
    answers: z
        .array(
            z
                .string()
                .regex(
                    new RegExp(/[^|]/),
                    "'|' is an invalid character. Please remove it from your answer.",
                ),
        )
        .min(1, {
            message: "You have to select at least one answer",
        }),
});

type MultipleChoiceAnswerFormType = z.infer<
    typeof MultipleChoiceAnswerFormSchema
>;

type MultipleChoiceAnswerProps = {
    sessionId: string;
    question: MultipleChoiceQuestionMessageType;
};

export function MultipleChoiceAnswer({
    sessionId,
    question,
}: MultipleChoiceAnswerProps) {
    const [attendeeId] = useCustomSessionAttendeeId(sessionId);
    const { handleSubmitAnswer, isSubmittingAnswer } = usePublicSocket();

    const form = useForm<MultipleChoiceAnswerFormType>({
        resolver: zodResolver(MultipleChoiceAnswerFormSchema),
        defaultValues: {
            answers: [],
        },
    });

    const isChecked = (answer: string) => {
        return form.getValues("answers").includes(answer);
    };

    const handleCheckedChange = (
        field: ControllerRenderProps<MultipleChoiceAnswerFormType, "answers">,
        answer: string,
        checked: CheckedState,
    ) => {
        if (checked) {
            return field.onChange([...field.value, answer]);
        }

        return field.onChange(field.value?.filter((value) => value !== answer));
    };

    const onSubmit = async ({ answers }: MultipleChoiceAnswerFormType) => {
        if (!attendeeId) {
            return toast.error("Attendee ID is required");
        }

        await handleSubmitAnswer(question.id, attendeeId, answers.join(" | "));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="answers"
                    render={() => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>

                            {question.options.map(({ id, option }) => (
                                <FormField
                                    key={id}
                                    control={form.control}
                                    name="answers"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={isChecked(
                                                            option,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleCheckedChange(
                                                                field,
                                                                option,
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </FormControl>

                                                <FormLabel className="text-sm font-normal">
                                                    {option}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmittingAnswer}>
                        Submit Answer
                    </Button>
                </div>
            </form>
        </Form>
    );
}
