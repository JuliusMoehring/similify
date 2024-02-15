import { usePathname, useSearchParams } from "next/navigation";
import { MessageCircleQuestionIcon } from "lucide-react";
import { InternalLinkButton } from "~/components/ui/link-button";
import { SEARCH_PARAMS } from "~/lib/search-params";

export function EmptyQuestions() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updatedSearchParams = new URLSearchParams(searchParams);

    updatedSearchParams.set(SEARCH_PARAMS.EDIT_MODE, "true");
    updatedSearchParams.sort();

    return (
        <div className="flex h-64 w-full flex-col items-center justify-center space-y-2 rounded outline-dashed outline-1">
            <MessageCircleQuestionIcon className="text-muted h-10 w-10" />

            <p className="max-w-96 px-4 text-center">
                You have not added any questions yet. Change to{" "}
                <span>edit mode</span> to add your first question.
            </p>

            <InternalLinkButton
                href={`${pathname}?${updatedSearchParams.toString()}`}
                variant="outline"
            >
                Go into edit mode
            </InternalLinkButton>
        </div>
    );
}
