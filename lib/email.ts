import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendReplyNotification({
  to,
  threadUrl,
}: {
  to: string;
  threadUrl: string;
}) {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY not configured; skipping reply notification email",
    );
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Vestry <onboarding@resend.dev>",
    to,
    subject: "You have a reply on Vestry",
    text: `Someone replied to your question. View it here: ${threadUrl}`,
  });
}
