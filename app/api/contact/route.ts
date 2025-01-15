import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface Payload {
    name: string;
    email: string;
    message: string;
}

// Create and configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSKEY,
    },
});

// Helper function to send a message via Telegram
async function sendTelegramMessage(
    token: string,
    chat_id: string,
    message: string
): Promise<boolean> {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
        const res = await axios.post(url, {
            text: message,
            chat_id,
        });
        return res.data.ok === true;
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
            console.error('Error sending Telegram message:', error.response.data);
        } else {
            console.error('Unknown error sending Telegram message:', error);
        }
        return false;
    }
}

// HTML email template
const generateEmailTemplate = (name: string, email: string, userMessage: string): string => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left: 0;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Helper function to send an email via Nodemailer
async function sendEmail(payload: Payload, message: string): Promise<boolean> {
    const { name, email, message: userMessage } = payload;

    const mailOptions = {
        from: 'Portfolio',
        to: process.env.EMAIL_ADDRESS as string,
        subject: `New Message From ${name}`,
        text: message,
        html: generateEmailTemplate(name, email, userMessage),
        replyTo: email,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error while sending email:', error.message);
        } else {
            console.error('Unknown error while sending email:', error);
        }
        return false;
    }
}

// POST handler
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload: Payload = await request.json();
        const { name, email, message: userMessage } = payload;
        const token = process.env.TELEGRAM_BOT_TOKEN as string;
        const chat_id = process.env.TELEGRAM_CHAT_ID as string;

        // CORS Headers
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');

        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers });
        }

        // Validasi environment variables
        if (!token || !chat_id) {
            return NextResponse.json({
                success: false,
                message: 'Telegram token or chat ID is missing.',
            }, { status: 400, headers });
        }

        const message = `New message from ${name}\n\nEmail: ${email}\n\nMessage:\n\n${userMessage}\n\n`;

        // Send Telegram message
        const telegramSuccess = await sendTelegramMessage(token, chat_id, message);

        // Send email
        const emailSuccess = await sendEmail(payload, message);

        if (telegramSuccess && emailSuccess) {
            return NextResponse.json({
                success: true,
                message: 'Message and email sent successfully!',
            }, { status: 200, headers });
        }

        return NextResponse.json({
            success: false,
            message: 'Failed to send message or email.',
        }, { status: 500, headers });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error occurred.',
        }, { status: 500 });
    }
}
