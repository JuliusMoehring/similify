import { db, eq } from "database";
import { Socket, Namespace } from "socket.io";
import {
    FreeTextQuestionMessageSchema,
    MultipleChoiceQuestionMessageSchema,
    QuestionType,
    SOCKET_EVENT,
    SingleChoiceQuestionMessageSchema,
} from "./client";
import { z, ZodError } from "zod";

const DEFAULT_QUESTION_INTERVAL = 2 * 60;

export class ActiveSessionHandler {
    private sessionId: string;

    private questions: QuestionType[] = [];

    private questionIntervalInSeconds: number;
    private nodeJSTimeout: NodeJS.Timeout | null = null;
    private currentQuestionIndex: number = 0;

    constructor(
        sessionId: string,
        questionIntervalInSeconds: number = DEFAULT_QUESTION_INTERVAL,
    ) {
        this.sessionId = sessionId;
        this.questionIntervalInSeconds = questionIntervalInSeconds;
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

    startSession(socket: Socket, publicIO: Namespace) {
        socket.join(this.sessionId);

        socket.emit(SOCKET_EVENT.START_SESSION, {
            status: "ok",
        });

        const question = this.getNextQuestion();

        if (!question) {
            return;
        }

        publicIO.to(this.sessionId).emit(SOCKET_EVENT.NEXT_QUESTION, {
            secondsToNextQuestion: this.questionIntervalInSeconds,
            question,
        });

        this.nodeJSTimeout = setInterval(() => {
            const question = this.getNextQuestion();

            if (!question) {
                clearInterval(this.nodeJSTimeout!);
                this.nodeJSTimeout = null;

                publicIO
                    .to(this.sessionId)
                    .emit(SOCKET_EVENT.NEXT_QUESTION, null);

                socket.leave(this.sessionId);
                return;
            }

            publicIO.to(this.sessionId).emit(SOCKET_EVENT.NEXT_QUESTION, {
                secondsToNextQuestion: this.questionIntervalInSeconds,
                question,
            });
        }, this.questionIntervalInSeconds * 1000);
    }
}
