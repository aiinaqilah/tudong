import { Resend } from "resend";

const FROM = "onboarding@resend.dev";

export async function sendShippedEmail({
  to,
  orderNumber,
  trackingNumber,
  trackingUrl,
}: {
  to: string;
  orderNumber: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your order #${orderNumber} has been shipped!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 8px;">Your order is on its way! 🚚</h2>
        <p>Order <strong>#${orderNumber}</strong> has been shipped and is heading your way.</p>
        ${trackingNumber ? `<p>Tracking Number: <strong style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${trackingNumber}</strong></p>` : ""}
        ${trackingUrl ? `<p><a href="${trackingUrl}" style="color: #7c3aed; font-weight: 600;">Track your shipment →</a></p>` : ""}
        <p style="color: #555; margin-top: 24px;">Once you receive your order, log in to your dashboard and click <strong>Order Received</strong> to confirm delivery.</p>
      </div>
    `,
  });
}

export async function sendOrderCompleteEmail({
  to,
  orderNumber,
  customerName,
}: {
  to: string;
  orderNumber: string;
  customerName?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order #${orderNumber} has been received`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 8px;">Order Complete ✅</h2>
        <p><strong>${customerName ?? "A customer"}</strong> has confirmed receipt of order <strong>#${orderNumber}</strong>.</p>
        <p style="color: #555;">The order has been marked as Delivered.</p>
      </div>
    `,
  });
}
