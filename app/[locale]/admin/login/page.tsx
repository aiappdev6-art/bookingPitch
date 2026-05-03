import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <LoginForm locale={locale} />
    </div>
  );
}
