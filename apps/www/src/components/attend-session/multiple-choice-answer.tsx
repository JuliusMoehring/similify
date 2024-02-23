import { MultipleChoiceQuestionMessageType } from "socket/src/client";
import { z } from "zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
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
import { Checkbox } from "../ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

const MultipleChoiceAnswerFormSchema = z.object({
    answerIds: z.array(z.string().uuid()).min(1, {
        message: "You have to select at least one answer",
    }),
});

type MultipleChoiceAnswerFormType = z.infer<
    typeof MultipleChoiceAnswerFormSchema
>;

type MultipleChoiceAnswerProps = {
    question: MultipleChoiceQuestionMessageType;
};

export function MultipleChoiceAnswer({ question }: MultipleChoiceAnswerProps) {
    const form = useForm<MultipleChoiceAnswerFormType>({
        resolver: zodResolver(MultipleChoiceAnswerFormSchema),
        defaultValues: {
            answerIds: [],
        },
    });

    const isChecked = (id: string) => {
        return form.getValues("answerIds").includes(id);
    };

    const handleCheckedChange = (
        field: ControllerRenderProps<MultipleChoiceAnswerFormType, "answerIds">,
        id: string,
        checked: CheckedState,
    ) => {
        if (checked) {
            return field.onChange([...field.value, id]);
        }

        return field.onChange(field.value?.filter((value) => value !== id));
    };

    const onSubmit = (data: MultipleChoiceAnswerFormType) => {
        console.log("data", data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="answerIds"
                    render={() => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>

                            {question.options.map(({ id, option }) => (
                                <FormField
                                    key={id}
                                    control={form.control}
                                    name="answerIds"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={isChecked(id)}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleCheckedChange(
                                                                field,
                                                                id,
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
                    <Button type="submit">Submit Answer</Button>
                </div>
            </form>
        </Form>
    );
}
