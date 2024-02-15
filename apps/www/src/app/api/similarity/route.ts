import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest): Promise<NextResponse> {
    console.log(request.nextUrl.pathname);

    return NextResponse.json({
        status: "ok",
    });
}

export { handler as POST };
