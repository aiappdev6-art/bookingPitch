"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
      return;
    }
    window.location.href = `/${locale}/admin`;
  };

  return (
    <form onSubmit={submit} className="card p-6">
      <h1 className="text-xl font-bold mb-4">{t("login")}</h1>
      <label className="label">{t("email")}</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        dir="ltr"
      />
      <label className="label mt-3">{t("password")}</label>
      <input
        className="input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        dir="ltr"
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
        {loading ? "..." : t("signIn")}
      </button>
    </form>
  );
}
