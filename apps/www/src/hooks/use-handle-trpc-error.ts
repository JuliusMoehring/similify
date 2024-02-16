import { type TRPCClientErrorLike } from "@trpc/client";
import {
    type UseTRPCMutationResult,
    type UseTRPCQueryResult,
} from "@trpc/react-query/shared";
import {
    type Procedure,
    type ProcedureParams,
    type ProcedureType,
} from "@trpc/server";
import { useEffect } from "react";
import { toast } from "sonner";

export function useHandleTRPCError<P extends ProcedureParams>(
    query:
        | UseTRPCQueryResult<
              unknown,
              TRPCClientErrorLike<Procedure<ProcedureType, P>>
          >
        | UseTRPCMutationResult<
              unknown,
              TRPCClientErrorLike<Procedure<ProcedureType, P>>,
              unknown,
              unknown
          >,
    title: string,
    fallbackMessage: string,
) {
    useEffect(() => {
        if (!query.isError) {
            return;
        }

        toast.error(title, {
            description: query.error.message ?? fallbackMessage,
        });
    }, [query.isError, query.error, title, fallbackMessage]);
}
