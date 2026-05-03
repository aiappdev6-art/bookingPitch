import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

export type BookingEmailData = {
  to: string;
  customerName: string;
  pitchName: string;
  startsAt: Date;
  endsAt: Date;
  totalPrice: string;
  bookingId: string;
  locale?: "ar" | "en";
};

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!resend) {
    console.log("[Resend not configured] would send to", data.to);
    return;
  }
  const isAr = data.locale === "ar";
  const subject = isAr
    ? `تأكيد الحجز #${data.bookingId.slice(0, 8)}`
    : `Booking Confirmation #${data.bookingId.slice(0, 8)}`;
  const html = isAr
    ? `<div dir="rtl" style="font-family:system-ui;padding:24px;max-width:560px">
        <h2>شكراً ${data.customerName}!</h2>
        <p>تم تأكيد حجزك في <strong>${data.pitchName}</strong>.</p>
        <p>التاريخ: ${data.startsAt.toLocaleString("ar-KW", { timeZone: "Asia/Kuwait" })}</p>
        <p>المبلغ المدفوع: ${data.totalPrice} د.ك</p>
        <p>رقم الحجز: ${data.bookingId}</p>
       </div>`
    : `<div style="font-family:system-ui;padding:24px;max-width:560px">
        <h2>Thank you, ${data.customerName}!</h2>
        <p>Your booking at <strong>${data.pitchName}</strong> is confirmed.</p>
        <p>Time: ${data.startsAt.toLocaleString("en-US", { timeZone: "Asia/Kuwait" })}</p>
        <p>Total paid: ${data.totalPrice} KWD</p>
        <p>Booking ID: ${data.bookingId}</p>
       </div>`;
  return resend.emails.send({ from: FROM_EMAIL, to: data.to, subject, html });
}
