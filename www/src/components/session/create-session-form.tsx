"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
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

const CreateSessionFormSchema = z.object({
    name: z.string().min(3, {
        message: "Session name must be at least 3 characters.",
    }),
    typeId: z.string().uuid({
        message: "Please select a session type.",
    }),
});

type CreateSessionFormType = z.infer<typeof CreateSessionFormSchema>;

export function CreateSessionForm() {
    const apiUtils = api.useUtils();

    const sessionTypesQuery = api.session.getSessionTypes.useQuery();

    useHandleTRPCError(
        sessionTypesQuery,
        "Failed to load session types",
        "Failed to load session types",
    );

    const createSessionMutation = api.session.createSession.useMutation();

    const form = useForm<CreateSessionFormType>({
        resolver: zodResolver(CreateSessionFormSchema),
        defaultValues: {
            name: "",
            typeId: "",
        },
    });

    const onSubmit = async ({ name, typeId }: CreateSessionFormType) => {
        const sessionId = await createSessionMutation.mutateAsync({
            name,
            typeId,
        });

        apiUtils.session.getSessions.invalidate();

        toast.success(`${name} session created.`, {
            description: `Your session has been created with the id ${sessionId}.`,
        });
    };

    return (
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
                                <Input placeholder="Session name" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Session Type</FormLabel>

                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="The type of the session" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {sessionTypesQuery.data?.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button>
                    {createSessionMutation.isLoading
                        ? "Creating session..."
                        : "Create session"}
                </Button>
            </form>
        </Form>
    );
}
