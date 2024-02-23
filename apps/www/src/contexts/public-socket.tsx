import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import {
    SOCKET_EVENT,
    QuestionMessageSchema,
    QuestionMessageType,
} from "socket/src/client";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { ZodError } from "zod";

import { env } from "~/env";

type PublicSocketContextType = {
    isConnected: boolean;
    joinSession: (sessionId: string) => void;
    leaveSession: (sessionId: string) => void;
    currentMessage: QuestionMessageType | null;
};

const PublicSocketContext = createContext<PublicSocketContextType | null>(null);

export function PublicSocketProvider({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(false);

    const [currentMessage, setCurrentMessage] =
        useState<QuestionMessageType | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSessionMessage = (message: unknown) => {
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        try {
            const question = QuestionMessageSchema.nullable().parse(message);

            setCurrentMessage(question);

            if (!question) {
                return;
            }

            const secondsToNextQuestion = question?.secondsToNextQuestion;

            messageTimeoutRef.current = setTimeout(() => {
                setCurrentMessage(null);
            }, secondsToNextQuestion * 1000);
        } catch (error) {
            console.error(error);

            if (error instanceof ZodError) {
                toast.error("Invalid message from socket", {
                    description: JSON.stringify(error.issues, null, 2),
                });
            }
        }
    };

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
        socketRef.current.on(SOCKET_EVENT.NEXT_QUESTION, handleSessionMessage);

        return () => {
            socketRef.current?.off("connect", onConnect);
            socketRef.current?.off("disconnect", onDisconnect);
            socketRef.current?.off(
                SOCKET_EVENT.NEXT_QUESTION,
                handleSessionMessage,
            );

            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, []);

    return (
        <PublicSocketContext.Provider
            value={{
                isConnected,
                joinSession,
                leaveSession,
                currentMessage,
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
