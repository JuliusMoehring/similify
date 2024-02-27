import { DicesIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useAttendSessionForm } from "~/hooks/use-attend-session-form";
import { generateRandomUsername } from "~/lib/generate-random-username";

type AttendSessionUsernameFormFieldProps = {
    form: ReturnType<typeof useAttendSessionForm>;
};

export function AttendSessionUsernameFormField({
    form,
}: AttendSessionUsernameFormFieldProps) {
    return (
        <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Username</FormLabel>

                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="Username" {...field} />
                        </FormControl>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                form.clearErrors("username");
                                form.setValue(
                                    "username",
                                    generateRandomUsername(),
                                );
                            }}
                        >
                            <DicesIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    <FormMessage />

                    <FormDescription>
                        Your name will be used to display the similarity between
                        the attendees of the session once the session is live.
                        Make sure to use a name that you are comfortable with
                        sharing with others.
                    </FormDescription>
                </FormItem>
            )}
        />
    );
}
