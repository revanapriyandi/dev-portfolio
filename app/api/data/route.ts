import { NextResponse } from "next/server";

// Define the return type for the response data
interface ResponseData {
    success: boolean;
    message: string;
    data: {
        message: string;
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request): Promise<NextResponse> {
    const responseData: ResponseData = {
        success: true,
        message: 'Hello!',
        data: {
            message: 'Message and email sent successfully!',
        },
    };

    return NextResponse.json(responseData, { status: 200 });
}
