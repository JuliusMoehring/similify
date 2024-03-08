import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { io, Socket } from "socket.io-client";
import {
    NextQuestionMessageSchema,
    QuestionType,
    SOCKET_EVENT,
} from "socket/src/client";
import { toast } from "sonner";

import { env } from "~/env";
import { api } from "~/trpc/react";

type AdminSocketContextType = {
    isConnected: boolean;
    startSession: (sessionId: string) => void;
    nextQestion: (sessionId: string) => void;
    closeQuestion: (sessionId: string) => void;
    endSession: (sessionId: string) => void;
    currentQuestion: QuestionType | null;
};

const AdminSocketContext = createContext<AdminSocketContextType | null>(null);

export function AdminSocketProvider({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
        null,
    );

    const socketRef = useRef<Socket | null>(null);

    const getAPITokenMutation = api.socket.getAPIToken.useMutation();

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const handleNextQuestion = (data: unknown) => {
            try {
                const nextQuestionMessage =
                    NextQuestionMessageSchema.parse(data);

                if (nextQuestionMessage.status === "ok") {
                    setCurrentQuestion(nextQuestionMessage.question);
                    toast.success("Next question has been sent", {
                        description:
                            "All attendees will now see the next question.",
                    });
                }

                if (nextQuestionMessage.status === "error") {
                    throw new Error(
                        JSON.stringify(nextQuestionMessage.error, null, 2),
                    );
                }
            } catch (error) {
                console.error(error);

                toast.error("Failed to get next question", {
                    description: JSON.stringify(error, null, 2),
                });
            }
        };

        const handleCloseQuestion = () => {
            setCurrentQuestion(null);
            toast.success("Question has been closed", {
                description: "You can now start the next question.",
            });
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
            socketRef.current.on(
                SOCKET_EVENT.NEXT_QUESTION,
                handleNextQuestion,
            );
            socketRef.current.on(
                SOCKET_EVENT.CLOSE_QUESTION,
                handleCloseQuestion,
            );
        };

        connect();

        return () => {
            socketRef.current?.disconnect();

            socketRef.current?.off("connect", onConnect);
            socketRef.current?.off("disconnect", onDisconnect);
            socketRef.current?.off(
                SOCKET_EVENT.NEXT_QUESTION,
                handleNextQuestion,
            );
            socketRef.current?.off(
                SOCKET_EVENT.CLOSE_QUESTION,
                handleCloseQuestion,
            );

            socketRef.current = null;
        };
    }, []);

    const startSession = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.START_SESSION, {
            sessionId,
        });
    };

    const nextQestion = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.NEXT_QUESTION, {
            sessionId,
        });
    };

    const closeQuestion = (sessionId: string) => {
        socketRef.current?.emit(SOCKET_EVENT.CLOSE_QUESTION, {
            sessionId,
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
                nextQestion,
                closeQuestion,
                endSession,
                currentQuestion,
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
