import {
    CUSTOM_QUESTION_TYPE,
    CustomQuestionTypeSchema,
} from "~/lib/custom-question-type";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useSessionQuestion } from "../context";

export function SessionQuestionType() {
    const { index: questionIndex, handlers, field } = useSessionQuestion();

    const hasTypePlaceholder = field.type === null;

    const handleUpdateQuestionType = (index: number, type: string) => {
        const parsedType = CustomQuestionTypeSchema.parse(type);

        if (parsedType === CUSTOM_QUESTION_TYPE.FREE_TEXT) {
            return handlers.update(index, {
                type: parsedType,
                question: "",
            });
        }

        handlers.update(index, {
            type: parsedType,
            question: "",
            options: [{ option: "" }],
        });
    };
    return (
        <div className="space-y-2">
            <Label>Question Type</Label>

            <Select
                onValueChange={(value) =>
                    handleUpdateQuestionType(questionIndex, value)
                }
                value={field.type ?? undefined}
            >
                <SelectTrigger
                    className={cn(
                        hasTypePlaceholder
                            ? "text-muted-foreground"
                            : "capitalize",
                    )}
                >
                    <SelectValue placeholder="Select type of question" />
                </SelectTrigger>

                <SelectContent>
                    {Object.entries(CUSTOM_QUESTION_TYPE).map(
                        ([key, value]) => {
                            return (
                                <SelectItem
                                    key={key}
                                    value={value}
                                    className="capitalize"
                                >
                                    {value.split("-").join(" ").toLowerCase()}
                                </SelectItem>
                            );
                        },
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
