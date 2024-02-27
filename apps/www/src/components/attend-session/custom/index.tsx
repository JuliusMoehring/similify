import { PublicSocketProvider } from "@contexts/public-socket";

type AttendCustomSessionProps = {
    sessionId: string;
};

export function AttendCustomSession({ sessionId }: AttendCustomSessionProps) {
    return (
        <PublicSocketProvider sessionId={sessionId}>
            <div>Waiting for questions</div>
            {/**
             <div className="flex justify-center p-4">
                 {currentMessage && (
                     <AnswerContainer
                         message={currentMessage}
                         className="mt-16 max-h-96 w-[640px] max-w-full sm:mt-60"
                     >
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
                     </AnswerContainer>
                 )}
             </div> */}
        </PublicSocketProvider>
    );
}
