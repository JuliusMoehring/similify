import { TRPCClientError } from "@trpc/client";
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
    QuestionMessageSchema,
    QuestionMessageType,
    SOCKET_EVENT,
} from "socket/src/client";
import { toast } from "sonner";
import { ZodError } from "zod";

import { FreeTextAnswer } from "~/components/attend-session/custom/free-text-answer";
import { MultipleChoiceAnswer } from "~/components/attend-session/custom/multiple-choice-answer";
import { SingleChoiceAnswer } from "~/components/attend-session/custom/single-choice-answer";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { env } from "~/env";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { api } from "~/trpc/react";

type PublicSocketContextType = {
    isConnected: boolean;
    currentMessage: QuestionMessageType | null;
    handleSubmitAnswer: (
        questionId: string,
        attendeeId: string,
        answer: string,
    ) => Promise<string | number | undefined>;
    isSubmittingAnswer: boolean;
};

const PublicSocketContext = createContext<PublicSocketContextType | null>(null);

type PublicSocketProviderProps = {
    sessionId: string;
};

export function PublicSocketProvider({
    sessionId,
    children,
}: PropsWithChildren<PublicSocketProviderProps>) {
    const [isConnected, setIsConnected] = useState(false);

    const [currentMessage, setCurrentMessage] =
        useState<QuestionMessageType | null>(null);

    const socketRef = useRef<Socket | null>(null);

    const answerQuestionMutation =
        api.custom.answerCustomQuestion.useMutation();

    const handleNextQuestion = (message: unknown) => {
        try {
            const question = QuestionMessageSchema.nullable().parse(message);

            setCurrentMessage(question);
        } catch (error) {
            console.error(error);

            if (error instanceof ZodError) {
                toast.error("Invalid message from socket", {
                    description: JSON.stringify(error.issues, null, 2),
                });
            }
        }
    };

    const handleCloseQuestion = () => {
        setCurrentMessage(null);
    };

    const handleSubmitAnswer = async (
        questionId: string,
        attendeeId: string,
        answer: string,
    ) => {
        try {
            await answerQuestionMutation.mutateAsync({
                sessionId,
                questionId,
                attendeeId,
                answer,
            });

            toast.success("Answer submitted", {
                description: "Your answer has been submitted successfully",
            });

            setCurrentMessage(null);
        } catch (error) {
            console.error(error);

            if (error instanceof TRPCClientError) {
                return toast.error("Failed to submit answer", {
                    description: error.message,
                });
            }

            toast.error("Failed to submit answer");
        }
    };

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);

            socketRef.current?.emit(SOCKET_EVENT.JOIN_SESSION, {
                sessionId,
            });
        };

        const onDisconnect = () => {
            setIsConnected(false);

            socketRef.current?.emit(SOCKET_EVENT.LEAVE_SESSION, {
                sessionId,
            });
        };

        socketRef.current = io(`${env.NEXT_PUBLIC_SOCKET_URL}/public`);

        socketRef.current.on("connect", onConnect);
        socketRef.current.on("disconnect", onDisconnect);
        socketRef.current.on(SOCKET_EVENT.NEXT_QUESTION, handleNextQuestion);
        socketRef.current.on(SOCKET_EVENT.CLOSE_QUESTION, handleCloseQuestion);

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
    }, [sessionId]);

    useEffect(() => {
        console.log("currentMessage", currentMessage);
    }, [currentMessage]);

    return (
        <PublicSocketContext.Provider
            value={{
                isConnected,
                currentMessage,
                handleSubmitAnswer,
                isSubmittingAnswer: answerQuestionMutation.isLoading,
            }}
        >
            {children}

            <AlertDialog open={currentMessage !== null}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogDescription>
                            {currentMessage?.question.order}. Question
                        </AlertDialogDescription>
                        <AlertDialogTitle>
                            {currentMessage?.question.question}
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.FREE_TEXT && (
                        <FreeTextAnswer
                            sessionId={sessionId}
                            questionId={currentMessage.question.id}
                        />
                    )}

                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.SINGLE_CHOICE && (
                        <SingleChoiceAnswer
                            sessionId={sessionId}
                            question={currentMessage.question}
                        />
                    )}

                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE && (
                        <MultipleChoiceAnswer
                            sessionId={sessionId}
                            question={currentMessage.question}
                        />
                    )}
                </AlertDialogContent>
            </AlertDialog>
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
