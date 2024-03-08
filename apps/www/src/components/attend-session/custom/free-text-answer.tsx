import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomSessionAttendeeId } from "@hooks/use-custom-session-attendee-id";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { usePublicSocket } from "~/contexts/public-socket";

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
    const { handleSubmitAnswer, isSubmittingAnswer } = usePublicSocket();

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

        await handleSubmitAnswer(questionId, attendeeId, answer);
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
                    <Button type="submit" disabled={isSubmittingAnswer}>
                        Submit Answer
                    </Button>
                </div>
            </form>
        </Form>
    );
}
