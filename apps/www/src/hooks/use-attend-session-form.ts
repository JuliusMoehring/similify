import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const AttendSessionFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Your username must be at least 2 characters.",
        })
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message:
                "Your username can only contain letters, numbers, underscores, and hyphens.",
        }),
});

export type AttendSessionFormType = z.infer<typeof AttendSessionFormSchema>;

export const useAttendSessionForm = () => {
    return useForm<AttendSessionFormType>({
        resolver: zodResolver(AttendSessionFormSchema),
        defaultValues: {
            username: "",
        },
    });
};
