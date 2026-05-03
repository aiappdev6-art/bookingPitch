"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deletePitchAction } from "@/app/actions/pitches";

export function DeletePitchButton({ id }: { id: string }) {
  const t = useTranslations("Admin");
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(t("deletePitch") + "?")) return;
        start(async () => {
          await deletePitchAction(id);
        });
      }}
      className="text-red-600"
    >
      {t("deletePitch")}
    </button>
  );
}
