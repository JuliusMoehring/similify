import { Card } from "~/components/ui/card";

export default function CustomLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex items-center justify-center px-4">
            <Card className="mt-24 w-96 space-y-4 p-4">{children}</Card>
        </main>
    );
}
