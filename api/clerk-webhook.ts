import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Webhook } from "svix";
import { Resend } from "resend";

// Svix signature verification needs the exact raw request bytes — re-serializing an
// already-parsed body can byte-mismatch the original payload and fail verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;
const notifyEmail = process.env.NOTIFY_TEACHER_SIGNUP_EMAIL ?? "alhanampi@gmail.com";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
  };
}

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    res.status(500).json({ error: "Webhook not configured" });
    return;
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  const rawBody = await readRawBody(req);
  const webhook = new Webhook(webhookSecret);

  let event: ClerkUserCreatedEvent;
  try {
    event = webhook.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch (error) {
    console.error("Clerk webhook signature verification failed", error);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  if (event.type !== "user.created") {
    res.status(200).json({ received: true });
    return;
  }

  const email = event.data.email_addresses?.[0]?.email_address ?? "unknown";
  const name =
    [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || "New teacher";

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Teacher's Pet <onboarding@resend.dev>",
        to: notifyEmail,
        subject: "New teacher signed up",
        text: `${name} (${email}) just created a teacher account.`,
      });
    } catch (error) {
      console.error("Failed to send teacher signup notification email", error);
    }
  } else {
    console.error("RESEND_API_KEY is not set — skipping signup notification email");
  }

  res.status(200).json({ received: true });
}
