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
            <div className="flex justify-center items-center px-4">
                <Card className="mt-24 max-w-3xl">
                    <CardContent>
                        <SpotifyIcon className="min-w-64 w-1/2 m-auto" />

                        {children}
                    </CardContent>
                </Card>
            </div>
        </SpotifyProvider>
    );
}
