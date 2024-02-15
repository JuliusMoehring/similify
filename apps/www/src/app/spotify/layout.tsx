import { SpotifyIcon } from "~/components/icons/spotify";
import { Card, CardContent } from "~/components/ui/card";
import { SpotifyProvider } from "~/contexts/spotify";

export default function SpotifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SpotifyProvider>
            <main className="flex items-center justify-center px-4">
                <Card className="mt-24 w-96">
                    <CardContent>
                        <SpotifyIcon className="m-auto w-1/2 min-w-64" />

                        {children}
                    </CardContent>
                </Card>
            </main>
        </SpotifyProvider>
    );
}
