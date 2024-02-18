import { SpotifyIcon } from "~/components/icons/spotify";
import { SpotifyStepper } from "~/components/spotify/stepper";
import { Card } from "~/components/ui/card";

export default function SpotifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex items-center justify-center px-4">
            <Card className="mt-24 w-96 space-y-4 p-4">
                <SpotifyStepper />

                <SpotifyIcon className="m-auto h-12 w-40" />

                {children}
            </Card>
        </main>
    );
}
