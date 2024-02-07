import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: ["/api/spotify/token"],
});

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
};
