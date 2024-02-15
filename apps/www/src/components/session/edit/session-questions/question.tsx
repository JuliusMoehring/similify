import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useSessionQuestion } from "../context";

export function SessionQuestionQuestion() {
    const { index: questionIndex, field, control } = useSessionQuestion();

    if (field.type === null) {
        return null;
    }

    return (
        <FormField
            control={control}
            name={`questions.${questionIndex}.question`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Question</FormLabel>

                    <FormControl>
                        <Input placeholder="Your question" {...field} />
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
