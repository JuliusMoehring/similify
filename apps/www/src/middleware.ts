import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: (request) => {
        if (request.nextUrl.pathname.includes("/api")) {
            return true;
        }

        return false;
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
};
