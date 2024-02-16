"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
    SESSION_TYPE,
    SESSION_TYPE_DESCRIPTIONS,
    SessionTypeSchema,
    SessionTypeType,
} from "~/lib/session-type";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const CreateSessionFormSchema = z.object({
    name: z.string().min(3, {
        message: "Session name must be at least 3 characters.",
    }),
    description: z.string().min(3, {
        message: "Session description must be at least 3 characters.",
    }),
    type: SessionTypeSchema,
});

type SessionTypeDescriptionProps = {
    type: SessionTypeType | undefined;
};

function SessionTypeDescription({ type }: SessionTypeDescriptionProps) {
    if (!type) {
        return null;
    }

    const desctiption = SESSION_TYPE_DESCRIPTIONS[type];

    if (!desctiption) {
        return null;
    }

    return <FormDescription>{desctiption}</FormDescription>;
}

type CreateSessionFormType = z.infer<typeof CreateSessionFormSchema>;

export function CreateSessionForm() {
    const router = useRouter();
    const apiUtils = api.useUtils();

    const createSessionMutation = api.session.createSession.useMutation();

    const form = useForm<CreateSessionFormType>({
        resolver: zodResolver(CreateSessionFormSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "",
        },
    });

    const onSubmit = async ({
        name,
        description,
        type,
    }: CreateSessionFormType) => {
        const sessionId = await createSessionMutation.mutateAsync({
            name,
            description,
            type,
        });

        await apiUtils.session.getSessions.invalidate();

        toast.success(`${name} session created.`, {
            description: `Your session has been created with the id ${sessionId}.`,
        });

        router.push(`/dashboard/session/${sessionId}`);
    };

    return (
        <div className="h-full overflow-hidden p-1">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Name</FormLabel>

                                <FormControl>
                                    <Input
                                        placeholder="Session name"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Description</FormLabel>

                                <FormControl>
                                    <Textarea
                                        placeholder="Session description"
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => {
                            const isPlaceholder = field.value === "";

                            return (
                                <FormItem>
                                    <FormLabel>Session Type</FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger
                                                className={cn(
                                                    isPlaceholder
                                                        ? "text-muted-foreground"
                                                        : "capitalize",
                                                )}
                                            >
                                                <SelectValue placeholder="The type of the session" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {Object.entries(SESSION_TYPE).map(
                                                ([key, value]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={value}
                                                        className="capitalize"
                                                    >
                                                        {value}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />

                                    <SessionTypeDescription
                                        type={field.value}
                                    />
                                </FormItem>
                            );
                        }}
                    />

                    <Button type="submit">
                        {createSessionMutation.isLoading
                            ? "Creating session..."
                            : "Create session"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
