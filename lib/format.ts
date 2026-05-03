export function formatKWD(amount: number | string, locale: string = "ar-KW") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 3,
  }).format(n);
}

export function formatDateTime(date: Date, locale: string = "ar-KW") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuwait",
  }).format(date);
}

export function formatDate(date: Date, locale: string = "ar-KW") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "Asia/Kuwait",
  }).format(date);
}

export function formatTime(date: Date, locale: string = "ar-KW") {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    timeZone: "Asia/Kuwait",
  }).format(date);
}
