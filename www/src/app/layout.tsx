import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "~/providers/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`font-sans ${inter.variable}`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <TRPCReactProvider>
                            {children}

                            <Toaster />
                        </TRPCReactProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
