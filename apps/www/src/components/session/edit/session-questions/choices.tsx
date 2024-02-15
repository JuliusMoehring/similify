import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { TrashIcon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { useSessionQuestion } from "../context";

export function SessionQuestionChoices() {
    const { index: questionIndex, field, control } = useSessionQuestion();

    if (
        field.type !== CUSTOM_QUESTION_TYPE.SINGLE_CHOICE &&
        field.type !== CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE
    ) {
        return null;
    }

    const { fields, ...optionHandlers } = useFieldArray({
        control: control,
        name: `questions.${questionIndex}.options`,
    });

    const handleAddOption = () => {
        optionHandlers.append({ option: "" });
    };

    const handleRemoveOption = (index: number) => {
        optionHandlers.remove(index);
    };

    return (
        <div className="space-y-2">
            <Label>Answer Choices</Label>

            {fields.map((option, optionIndex) => {
                return (
                    <FormField
                        key={option.id}
                        control={control}
                        name={`questions.${questionIndex}.options.${optionIndex}.option`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input
                                            placeholder={`Option ${
                                                optionIndex + 1
                                            }`}
                                            {...field}
                                        />
                                    </FormControl>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            handleRemoveOption(optionIndex)
                                        }
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            })}

            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleAddOption}
                size="sm"
            >
                <PlusIcon className="h-3 w-3" />
                Add Option
            </Button>
        </div>
    );
}
