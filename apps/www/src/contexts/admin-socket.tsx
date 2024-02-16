import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { SOCKET_EVENT } from "socket";
import { io, Socket } from "socket.io-client";

import { env } from "~/env";
import { api } from "~/trpc/react";

type AdminSocketContextType = {
    isConnected: boolean;
    startSession: (sessionId: string, interval?: number) => void;
    endSession: (sessionId: string) => void;
};

const AdminSocketContext = createContext<AdminSocketContextType | null>(null);

export function AdminSocketProvider({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    const getAPITokenMutation = api.socket.getAPIToken.useMutation();

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const connect = async () => {
            const apiToken = await getAPITokenMutation.mutateAsync();

            socketRef.current = io(`${env.NEXT_PUBLIC_SOCKET_URL}/admin`, {
                extraHeaders: {
                    Authorization: `${apiToken}`,
                },
            });

            socketRef.current.on("connect", onConnect);
            socketRef.current.on("disconnect", onDisconnect);
        };

        connect();

        return () => {
            socketRef.current?.off("connect", onConnect);
            socketRef.current?.off("disconnect", onDisconnect);
        };
    }, []);

    const startSession = (sessionId: string, interval: number = 60 * 3) => {
        socketRef.current?.emit(SOCKET_EVENT.START_SESSION, {
            sessionId,
            interval,
        });
    };

    const endSession = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.END_SESSION, {
            sessionId,
        });
    };

    return (
        <AdminSocketContext.Provider
            value={{
                isConnected,
                startSession,
                endSession,
            }}
        >
            {children}
        </AdminSocketContext.Provider>
    );
}

export function useAdminSocket() {
    const context = useContext(AdminSocketContext);

    if (context === null) {
        const error = new Error(
            "useAdminSocket must be used within a AdminSocketContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useAdminSocket);
        }

        throw error;
    }

    return context;
}
