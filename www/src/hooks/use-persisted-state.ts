import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

function getStateFromStorageValue<Z extends z.ZodTypeAny>(
    schema: Z,
    storageValue: string | null,
) {
    if (storageValue === null) {
        return null;
    }

    try {
        return schema.nullable().parse(JSON.parse(storageValue)) as z.infer<Z>;
    } catch (error) {
        console.error(error);

        toast.error("Failed to parse persisted state");

        return null;
    }
}

function getStateFromStorage<Z extends z.ZodTypeAny>(schema: Z, key: string) {
    const storageValue = localStorage.getItem(key);

    return getStateFromStorageValue(schema, storageValue);
}

function setStateInStorage(state: unknown, key: string) {
    if (state === null) {
        return localStorage.removeItem(key);
    }

    return localStorage.setItem(key, JSON.stringify(state));
}

function getInitialState(
    schema: z.ZodTypeAny,
    key: string,
    defaultValue: unknown,
) {
    if (typeof window === "undefined") {
        return defaultValue;
    }

    return getStateFromStorage(schema, key);
}

export function usePersistedState<Z extends z.ZodTypeAny = z.ZodNever>(
    schema: Z,
    key: string,
    defaultValue: z.infer<Z> | null,
) {
    type State = z.infer<Z> | null;

    const [state, setInternalState] = useState<State>(() =>
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

    const setState = (stateSetter: State | ((state: State) => State)) => {
        const valueToStore =
            stateSetter instanceof Function ? stateSetter(state) : stateSetter;

        setStateInStorage(valueToStore, key);
        setInternalState(valueToStore);
    };

    return [state, setState] as const;
}
