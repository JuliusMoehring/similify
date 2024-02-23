import { SingleChoiceQuestionMessageType } from "socket/src/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const SingleChoiceAnswerFormSchema = z.object({
    answerId: z
        .string({
            required_error: "Please select an answer",
        })
        .uuid(),
});

type SingleChoiceAnswerFormType = z.infer<typeof SingleChoiceAnswerFormSchema>;

type SingleChoiceAnswerProps = {
    question: SingleChoiceQuestionMessageType;
};

export function SingleChoiceAnswer({ question }: SingleChoiceAnswerProps) {
    const form = useForm<SingleChoiceAnswerFormType>({
        resolver: zodResolver(SingleChoiceAnswerFormSchema),
    });

    const onSubmit = (data: SingleChoiceAnswerFormType) => {
        console.log(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="answerId"
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
                                                <RadioGroupItem value={id} />
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
                    <Button type="submit">Submit Answer</Button>
                </div>
            </form>
        </Form>
    );
}
