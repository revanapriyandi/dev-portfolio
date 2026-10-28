import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isValidEmail } from '@/utils/check-email';
import { clientIp, rateLimiter } from '@/utils/rate-limit';
import { db } from '@/utils/db';

interface Payload {
    name: string;
    email: string;
    message: string;
}

const LIMITS = { name: 100, email: 200, message: 2000 };
const limited = rateLimiter(5, 60 * 60 * 1000); // 5 messages per IP per hour

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

// Visitor input goes into an HTML email, so escape it to keep injected markup/links out of the inbox.
const escapeHtml = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Strip line breaks from anything that lands in a mail header (subject).
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

// Returns a clean payload, or null when the input is missing, malformed or too long.
function validate(body: unknown): Payload | null {
    const b = body as Partial<Record<keyof Payload, unknown>> | null;
    if (!b || typeof b.name !== 'string' || typeof b.email !== 'string' || typeof b.message !== 'string') return null;
    const name = oneLine(b.name), email = b.email.trim(), message = b.message.trim();
    if (!name || !message || name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) return null;
    if (!isValidEmail(email)) return null;
    return { name, email, message };
}

// Helper function to send a message via Telegram
async function sendTelegramMessage(token: string, chat_id: string, message: string): Promise<boolean> {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
        const res = await axios.post(url, { text: message, chat_id });
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

// HTML email template — every value is escaped before it is interpolated
const generateEmailTemplate = (name: string, email: string, userMessage: string): string => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left: 0; white-space: pre-wrap;">${escapeHtml(userMessage)}</blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Helper function to send an email via Nodemailer
async function sendEmail(payload: Payload, message: string): Promise<boolean> {
    const { name, email, message: userMessage } = payload;
    try {
        await transporter.sendMail({
            from: `Portfolio <${process.env.EMAIL_ADDRESS}>`,
            to: process.env.EMAIL_ADDRESS as string,
            subject: `New Message From ${name}`,
            text: message,
            html: generateEmailTemplate(name, email, userMessage),
            replyTo: email,
        });
        return true;
    } catch (error: unknown) {
        console.error('Error while sending email:', error instanceof Error ? error.message : error);
        return false;
    }
}

// POST handler (same-origin only: no CORS headers, so other sites can't post through this form)
export async function POST(request: Request): Promise<NextResponse> {
    if (limited(clientIp(request))) {
        return NextResponse.json({ success: false, message: 'Too many messages. Please try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    // honeypot: real visitors never see or fill the hidden "website" field
    if (body && typeof body.website === 'string' && body.website.trim()) {
        return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    }

    const payload = validate(body);
    if (!payload) {
        return NextResponse.json({ success: false, message: 'Please provide a valid name, email and message.' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;
    const message = `New message from ${payload.name}\n\nEmail: ${payload.email}\n\nMessage:\n\n${payload.message}\n\n`;

    const [telegramSuccess, emailSuccess] = await Promise.all([
        token && chat_id ? sendTelegramMessage(token, chat_id, message) : Promise.resolve(false),
        process.env.EMAIL_ADDRESS && process.env.GMAIL_PASSKEY ? sendEmail(payload, message) : Promise.resolve(false),
    ]);

    // keep a copy in the admin inbox, even when both delivery channels failed
    const supabase = db();
    let stored = false;
    if (supabase) {
        const { error } = await supabase.from('portfolio_messages').insert({
            name: payload.name,
            email: payload.email,
            message: payload.message,
            delivered_telegram: telegramSuccess,
            delivered_email: emailSuccess,
        });
        if (error) console.error('Error storing message:', error.message);
        stored = !error;
    }

    // one delivered or stored copy is enough; details of what failed stay in the server log
    if (telegramSuccess || emailSuccess || stored) {
        return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    }
    return NextResponse.json({ success: false, message: 'Message could not be sent. Please try again later.' }, { status: 500 });
}
