"use client";

import { QrCodeIcon } from "lucide-react";
import { CopyToClipboardButton } from "~/components/copy-to-clipboard-button";
import { QRCode } from "~/components/qr-code";
import { SessionAttendees } from "~/components/session/session-attendees";
import { SessionQuestions } from "~/components/session/session-questions";
import { UpdateSessionStatusButton } from "~/components/session/update-status-button";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Headline } from "~/components/ui/headline";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useGetSession } from "~/hooks/use-get-session";
import { constructInviteURL } from "~/lib/invite-url";
import { SESSION_TYPE } from "~/lib/session-type";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = useGetSession(sessionId);

    if (sessionQuery.isLoading) {
        return <div>Loading session...</div>;
    }

    if (sessionQuery.error) {
        return <div>Failed to load session</div>;
    }

    const { id, name, description, type } = sessionQuery.data;

    const inviteLink = constructInviteURL(type, sessionId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Headline tag="h2" size="s">
                    {name}
                </Headline>

                <UpdateSessionStatusButton sessionId={id} />
            </div>

            <p className="text-muted-foreground">{description}</p>

            <div className="space-y-2">
                <Label>Invite link</Label>

                <div className="flex items-center gap-4">
                    <div className="border-input flex h-9 w-full items-center justify-between rounded-md border bg-transparent py-1 pl-3 text-sm shadow-sm">
                        <pre className="line-clamp-1 overflow-hidden">
                            {inviteLink}
                        </pre>

                        <CopyToClipboardButton
                            text={inviteLink}
                            variant="outline"
                            size="default"
                            className="rounded-l-none"
                        />
                    </div>

                    <Dialog>
                        <DialogTrigger>
                            <Button variant="outline" size="icon">
                                <QrCodeIcon className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="pt-12">
                            <QRCode content={inviteLink} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Separator />

            <SessionAttendees sessionId={id} />

            {type === SESSION_TYPE.CUSTOM && (
                <>
                    <Separator />

                    <SessionQuestions sessionId={sessionId} />
                </>
            )}
        </div>
    );
}
