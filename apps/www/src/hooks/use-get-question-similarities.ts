import { api } from "~/trpc/react";

export function useGetQuestionSimilarities(questionId: string | undefined) {
    const questionSimilaritiesQuery =
        api.similarity.getQuestionSimilarities.useQuery(
            {
                questionId: questionId!,
            },
            {
                enabled: Boolean(questionId),
            },
        );

    return questionSimilaritiesQuery;
}
