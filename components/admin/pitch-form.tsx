"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createPitchAction, updatePitchAction } from "@/app/actions/pitches";

type PitchInput = {
  id?: string;
  name: string;
  description: string;
  pricePerHour: string;
  capacity: number;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  location: string;
  surface: "GRASS" | "TURF" | "INDOOR";
  imageUrls: string[];
  isActive: boolean;
};

const blank: PitchInput = {
  name: "",
  description: "",
  pricePerHour: "10.000",
  capacity: 10,
  openingTime: "08:00",
  closingTime: "23:00",
  slotDurationMinutes: 60,
  location: "",
  surface: "GRASS",
  imageUrls: [],
  isActive: true,
};

export function PitchForm({
  mode,
  locale,
  pitch,
}: {
  mode: "create" | "edit";
  locale: string;
  pitch?: PitchInput;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [form, setForm] = useState<PitchInput>(pitch ?? blank);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof PitchInput>(key: K, value: PitchInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/storage/upload", { method: "POST", body: fd });
        const d = await up.json();
        if (d.ok && d.url) urls.push(d.url);
        else throw new Error(d.error || "Upload failed");
      }
      update("imageUrls", [...form.imageUrls, ...urls]);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Paste image URLs manually below.");
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        if (mode === "create") {
          await createPitchAction(form);
        } else if (pitch?.id) {
          await updatePitchAction(pitch.id, form);
        }
        router.push("/admin/pitches");
      } catch (err) {
        setError(String(err));
      }
    });
  };

  return (
    <form onSubmit={submit} className="card p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "create" ? t("newPitch") : t("editPitch")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")}>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </Field>
        <Field label={t("location")}>
          <input
            className="input"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </Field>
        <Field label={t("description")} className="sm:col-span-2">
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label={t("pricePerHour")}>
          <input
            className="input"
            type="number"
            step="0.001"
            value={form.pricePerHour}
            onChange={(e) => update("pricePerHour", e.target.value)}
            required
          />
        </Field>
        <Field label={t("capacity")}>
          <input
            className="input"
            type="number"
            value={form.capacity}
            onChange={(e) => update("capacity", Number(e.target.value))}
            required
          />
        </Field>
        <Field label={t("openingTime")}>
          <input
            className="input"
            type="time"
            value={form.openingTime}
            onChange={(e) => update("openingTime", e.target.value)}
          />
        </Field>
        <Field label={t("closingTime")}>
          <input
            className="input"
            type="time"
            value={form.closingTime}
            onChange={(e) => update("closingTime", e.target.value)}
          />
        </Field>
        <Field label={t("slotDuration")}>
          <input
            className="input"
            type="number"
            step="15"
            value={form.slotDurationMinutes}
            onChange={(e) => update("slotDurationMinutes", Number(e.target.value))}
          />
        </Field>
        <Field label={t("surface")}>
          <select
            className="input"
            value={form.surface}
            onChange={(e) => update("surface", e.target.value as PitchInput["surface"])}
          >
            <option value="GRASS">GRASS</option>
            <option value="TURF">TURF</option>
            <option value="INDOOR">INDOOR</option>
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <label className="label">{t("images")}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-[var(--muted-foreground)]">…</p>}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {form.imageUrls.map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square object-cover rounded-lg w-full" />
              <button
                type="button"
                onClick={() =>
                  update(
                    "imageUrls",
                    form.imageUrls.filter((_, idx) => idx !== i)
                  )
                }
                className="absolute top-1 end-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          className="input mt-2"
          placeholder="Or paste an image URL and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) {
                update("imageUrls", [...form.imageUrls, v]);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
      </div>

      <label className="flex items-center gap-2 mt-6">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
        />
        <span>Active</span>
      </label>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={pending} className="btn-primary">
          {t("save")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pitches")}
          className="btn-outline"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
