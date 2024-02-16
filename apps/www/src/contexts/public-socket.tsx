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

type PublicSocketContextType = {
    isConnected: boolean;
    joinSession: (sessionId: string) => void;
    leaveSession: (sessionId: string) => void;
};

const PublicSocketContext = createContext<PublicSocketContextType | null>(null);

export function PublicSocketProvider({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        socketRef.current = io(`${env.NEXT_PUBLIC_SOCKET_URL}/public`);

        socketRef.current.on("connect", onConnect);
        socketRef.current.on("disconnect", onDisconnect);

        return () => {
            socketRef.current?.off("connect", onConnect);
            socketRef.current?.off("disconnect", onDisconnect);
        };
    }, []);

    const joinSession = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.JOIN_SESSION, {
            sessionId,
        });
    };

    const leaveSession = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.LEAVE_SESSION, {
            sessionId,
        });
    };

    return (
        <PublicSocketContext.Provider
            value={{
                isConnected,
                joinSession,
                leaveSession,
            }}
        >
            {children}
        </PublicSocketContext.Provider>
    );
}

export function usePublicSocket() {
    const context = useContext(PublicSocketContext);

    if (context === null) {
        const error = new Error(
            "usePublicSocket must be used within a PublicSocketContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, usePublicSocket);
        }

        throw error;
    }

    return context;
}
