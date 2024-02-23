import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const FreeTextAnswerFormSchema = z.object({
    answer: z.string().min(1, {
        message: "Answer is required",
    }),
});

type FreeTextAnswerFormType = z.infer<typeof FreeTextAnswerFormSchema>;

export function FreeTextAnswer() {
    const form = useForm<FreeTextAnswerFormType>({
        resolver: zodResolver(FreeTextAnswerFormSchema),
        defaultValues: {
            answer: "",
        },
    });

    const onSubmit = (data: FreeTextAnswerFormType) => {
        console.log(data);
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
                    <Button type="submit">Submit Answer</Button>
                </div>
            </form>
        </Form>
    );
}
