import { NextRequest, NextResponse } from "next/server";

type Context = {
    params: {
        sessionId: string;
    };
};

async function handler(
    request: NextRequest,
    { params }: Context,
): Promise<NextResponse> {
    const sessionId = params.sessionId;

    console.log(request.nextUrl.pathname, sessionId);

    return NextResponse.json({
        status: "ok",
    });
}

export { handler as POST };
