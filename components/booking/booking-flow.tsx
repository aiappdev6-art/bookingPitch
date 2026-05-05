"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { startBookingAction, getDayAvailability } from "@/app/actions/booking";
import { formatKWD } from "@/lib/format";

type Slot = { startsAt: string; endsAt: string; available: boolean };

export function BookingFlow({
  pitchId,
  pricePerHour,
  locale,
}: {
  pitchId: string;
  pricePerHour: string;
  locale: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    getDayAvailability(pitchId, date)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [pitchId, date]);

  const total = (Number(pricePerHour) * duration).toFixed(3);

  const submit = () => {
    if (!selectedSlot || !name.trim() || !phone.trim()) {
      setError(t("Booking.yourDetails"));
      return;
    }
    setError(null);
    setSubmitting(true);
    startTransition(async () => {
      const res = await startBookingAction({
        pitchId,
        startsAt: selectedSlot,
        durationHours: duration,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
      });
      setSubmitting(false);
      if (!res.ok) {
        setError(res.error === "SLOT_CONFLICT" ? t("Booking.slotTaken") : t("Common.error"));
        if (res.error === "SLOT_CONFLICT") {
          getDayAvailability(pitchId, date).then(setSlots);
        }
        return;
      }
      if (res.otpRequired) {
        router.push({
          pathname: "/verify-otp",
          query: { booking: res.bookingId, phone },
        });
      } else {
        router.push({
          pathname: "/checkout/start",
          query: { booking: res.bookingId },
        });
      }
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">{t("Pitches.bookNow")}</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="label">{t("Booking.selectDate")}</label>
          <input
            type="date"
            min={today}
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="label mt-4">{t("Booking.duration")}</label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDuration(h)}
                className={`px-4 py-2 rounded-lg border ${
                  duration === h
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                {t("Booking.hours", { count: h })}
              </button>
            ))}
          </div>

          <label className="label mt-4">{t("Booking.selectSlot")}</label>
          {loadingSlots ? (
            <div className="text-sm text-[var(--muted-foreground)]">{t("Common.loading")}</div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)]">{t("Pitches.noPitches")}</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s, i) => {
                const time = new Date(s.startsAt).toLocaleTimeString(localeTag, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kuwait",
                });
                const isSelected = selectedSlot === s.startsAt;
                return (
                  <button
                    key={s.startsAt}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.startsAt)}
                    className={`slot anim-scale ${
                      !s.available ? "slot-disabled" : isSelected ? "slot-selected" : ""
                    }`}
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3">{t("Booking.yourDetails")}</h3>
          <label className="label">{t("Booking.name")}</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
          />
          <label className="label mt-3">{t("Booking.phone")}</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+9655XXXXXXX"
            dir="ltr"
          />
          <label className="label mt-3">{t("Booking.email")}</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            dir="ltr"
          />

          <div className="mt-6 p-4 rounded-lg bg-[var(--muted)]">
            <h4 className="font-semibold mb-2">{t("Booking.summary")}</h4>
            <div className="flex justify-between text-sm">
              <span>{t("Booking.duration")}</span>
              <span>{t("Booking.hours", { count: duration })}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-[var(--border)]">
              <span>{t("Booking.total")}</span>
              <span>{formatKWD(total, localeTag)}</span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <button
            type="button"
            disabled={submitting || !selectedSlot}
            onClick={submit}
            className="btn-primary w-full mt-4"
          >
            {submitting ? t("Common.loading") : t("Booking.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
