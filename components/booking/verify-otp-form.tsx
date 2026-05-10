"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function VerifyOtpForm({ bookingId, phone }: { bookingId: string; phone: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      body: JSON.stringify({ bookingId, code }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!data.ok) {
      setSubmitting(false);
      setError(t("Common.error"));
      return;
    }

    // Create a MyFatoorah payment session and redirect to the hosted page.
    const checkout = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ bookingId, locale }),
      headers: { "Content-Type": "application/json" },
    });
    const cdata = await checkout.json();
    setSubmitting(false);
    if (cdata.paymentUrl) {
      window.location.href = cdata.paymentUrl;
    } else if (cdata.dev) {
      router.push({ pathname: "/checkout/success", query: { booking: bookingId } });
    } else {
      setError(cdata.error || t("Common.error"));
    }
  };

  const resend = async () => {
    await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ bookingId }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <div className="card p-6">
      <h1 className="text-xl font-bold mb-2">{t("Booking.verifyPhone")}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        {t("Booking.otpSent", { phone })}
      </p>
      <label className="label">{t("Booking.enterCode")}</label>
      <input
        className="input text-center tracking-widest text-lg"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        dir="ltr"
        placeholder="••••••"
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button
        type="button"
        disabled={submitting || code.length !== 6}
        onClick={submit}
        className="btn-primary w-full mt-4"
      >
        {submitting ? t("Common.loading") : t("Booking.verify")}
      </button>
      <button type="button" onClick={resend} className="btn-outline w-full mt-2">
        {t("Booking.resend")}
      </button>
    </div>
  );
}
