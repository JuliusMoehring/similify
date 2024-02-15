import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { env } from "~/env";
import { ThemeProvider } from "~/providers/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {
    metadata: {
        viewport: "width=device-width, initial-scale=1",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" dir="ltr" suppressHydrationWarning>
                <body
                    className={`h-screen w-screen overflow-hidden font-sans ${inter.variable}`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <TRPCReactProvider>
                            {children}

                            <Toaster />

                            <SpeedInsights />
                            <Analytics
                                mode={
                                    env.NODE_ENV === "production"
                                        ? "production"
                                        : "development"
                                }
                                debug={env.NODE_ENV !== "production"}
                            />
                        </TRPCReactProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
