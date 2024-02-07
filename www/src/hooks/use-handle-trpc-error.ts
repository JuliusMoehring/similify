import { TRPCClientErrorLike } from "@trpc/client";
import {
    UseTRPCMutationResult,
    UseTRPCQueryResult,
} from "@trpc/react-query/shared";
import { Procedure, ProcedureType } from "@trpc/server";
import { useEffect } from "react";
import { toast } from "sonner";

export function useHandleTRPCError(
    query:
        | UseTRPCQueryResult<
              any,
              TRPCClientErrorLike<Procedure<ProcedureType, any>>
          >
        | UseTRPCMutationResult<
              any,
              TRPCClientErrorLike<Procedure<ProcedureType, any>>,
              any,
              any
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
