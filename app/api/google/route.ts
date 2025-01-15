import axios from "axios";
import { NextResponse } from "next/server";

interface RequestBody {
    token: string;
}

interface CaptchaResponse {
    success: boolean;
}

export async function POST(request: Request): Promise<NextResponse> {
    const reqBody: RequestBody = await request.json();
    const secret_key: string | undefined = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret_key) {
        return NextResponse.json(
            {
                error: "Recaptcha secret key is missing!",
                success: false,
            },
            { status: 500 }
        );
    }

    try {
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${reqBody.token}`;

        const res = await axios.post<CaptchaResponse>(url);
        if (res.data.success) {
            return NextResponse.json({
                message: "Captcha verification success!!",
                success: true,
            });
        }

        return NextResponse.json(
            {
                error: "Captcha verification failed!",
                success: false,
            },
            { status: 400 }
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            {
                error: "Captcha verification failed due to a server error!",
                success: false,
            },
            { status: 500 }
        );
    }
}
