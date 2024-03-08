import { db, eq } from "database";
import { type Namespace, type Socket } from "socket.io";
import { z, ZodError } from "zod";

import {
    FreeTextQuestionMessageSchema,
    MultipleChoiceQuestionMessageSchema,
    QuestionType,
    SingleChoiceQuestionMessageSchema,
    SOCKET_EVENT,
} from "./client";

export class ActiveSessionHandler {
    private sessionId: string;

    private questions: QuestionType[] = [];

    private currentQuestionIndex: number = 0;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
    }

    private async fetchQuestions() {
        const questions = await db.query.customQuestions.findMany({
            columns: {
                id: true,
                question: true,
                type: true,
                order: true,
            },
            with: {
                options: {
                    columns: { id: true, option: true },
                },
            },
            where: (question) => eq(question.sessionId, this.sessionId),
            orderBy: (question, { asc }) => [asc(question.order)],
        });

        try {
            return z
                .array(
                    z.union([
                        FreeTextQuestionMessageSchema,
                        SingleChoiceQuestionMessageSchema,
                        MultipleChoiceQuestionMessageSchema,
                    ]),
                )
                .parse(questions);
        } catch (error) {
            console.error(error);

            if (error instanceof ZodError) {
                throw new Error("Unable to parse questions");
            }

            throw error;
        }
    }

    private getNextQuestion(): QuestionType | null {
        if (this.currentQuestionIndex >= this.questions.length) {
            return null;
        }

        const question = this.questions[this.currentQuestionIndex];

        if (!question) {
            return null;
        }

        this.currentQuestionIndex++;

        return question;
    }

    async init() {
        this.questions = await this.fetchQuestions();
    }

    startSession(socket: Socket) {
        socket.join(this.sessionId);

        socket.emit(SOCKET_EVENT.START_SESSION, {
            status: "ok",
        });
    }

    nextQuestion(socket: Socket, publicIO: Namespace) {
        const question = this.getNextQuestion();

        if (!question) {
            publicIO.to(this.sessionId).emit(SOCKET_EVENT.NEXT_QUESTION, null);

            return socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
                status: "error",
                message: "No more questions",
            });
        }

        publicIO.to(this.sessionId).emit(SOCKET_EVENT.NEXT_QUESTION, {
            question,
        });

        socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
            status: "ok",
            question,
        });
    }

    closeQuestion(socket: Socket, publicIO: Namespace) {
        publicIO.to(this.sessionId).emit(SOCKET_EVENT.CLOSE_QUESTION, null);

        socket.emit(SOCKET_EVENT.CLOSE_QUESTION, {
            status: "ok",
        });
    }
}
