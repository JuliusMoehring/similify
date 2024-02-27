import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

function getStateFromStorageValue<Z extends z.ZodTypeAny = z.ZodNever>(
    schema: Z,
    storageValue: string | null,
): z.infer<Z> | null {
    if (storageValue === null) {
        return null;
    }

    try {
        const json = JSON.parse(storageValue);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema.nullable().parse(json) as z.infer<Z>;
    } catch (error) {
        console.error(error);

        toast.error("Failed to parse persisted state");

        return null;
    }
}

function getStateFromStorage<Z extends z.ZodTypeAny = z.ZodNever>(
    schema: Z,
    key: string,
) {
    const storageValue = localStorage.getItem(key);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getStateFromStorageValue(schema, storageValue);
}

function setStateInStorage(state: unknown, key: string) {
    if (state === null) {
        return localStorage.removeItem(key);
    }

    return localStorage.setItem(key, JSON.stringify(state));
}

function getInitialState<Z extends z.ZodTypeAny = z.ZodNever>(
    schema: Z,
    key: string,
    defaultValue: z.infer<Z> | null,
): z.infer<Z> | null {
    if (typeof window === "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return defaultValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getStateFromStorage(schema, key);
}

export function usePersistedState<Z extends z.ZodTypeAny = z.ZodNever>(
    schema: Z,
    key: string,
    defaultValue: z.infer<Z> | null,
) {
    const [state, setInternalState] = useState<z.infer<Z> | null>(() =>
        getInitialState(schema, key, defaultValue),
    );

    useEffect(() => {
        const handleUpdateState = (event: StorageEvent) => {
            if (event.key === key) {
                const state = getStateFromStorageValue(schema, event.newValue);

                if (state === null) {
                    localStorage.removeItem(key);
                    return;
                }

                setInternalState(state);
            }
        };

        window.addEventListener("storage", handleUpdateState);

        return () => {
            window.removeEventListener("storage", handleUpdateState);
        };
    }, [schema, key]);

    const setState = (
        stateSetter:
            | z.infer<Z>
            | null
            | ((state: z.infer<Z> | null) => z.infer<Z> | null),
    ) => {
        const valueToStore =
            stateSetter instanceof Function ? stateSetter(state) : stateSetter;

        setStateInStorage(valueToStore, key);
        setInternalState(valueToStore);
    };

    return [state, setState] as const;
}
