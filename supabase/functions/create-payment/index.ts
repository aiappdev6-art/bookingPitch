// Supabase Edge Function: create-payment
// Creates a MyFatoorah hosted payment session and returns the payment URL.
//
// Request body: { amount, currency: "KWD", customerName, customerEmail, customerPhone, orderId, callbackUrl?, errorUrl? }
// Response: { paymentUrl, invoiceId }
//
// Secret required: MYFATOORAH_API_KEY (sandbox/production token)

// deno-lint-ignore-file no-explicit-any

const MYFATOORAH_BASE = "https://apitest.myfatoorah.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("MYFATOORAH_API_KEY");
  if (!apiKey) return json({ error: "MYFATOORAH_API_KEY not configured" }, 500);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const {
    amount,
    currency = "KWD",
    customerName,
    customerEmail,
    customerPhone,
    orderId,
    callbackUrl,
    errorUrl,
  } = payload ?? {};

  if (!amount || !customerName || !customerPhone || !orderId) {
    return json({ error: "Missing required fields" }, 400);
  }

  // Strip leading + and any non-digit; MyFatoorah expects pure digits.
  const mobile = String(customerPhone).replace(/\D/g, "").replace(/^965/, "");

  const origin = req.headers.get("origin") ?? "";
  const defaultCallback = `${origin}/payment/callback`;
  const defaultError = `${origin}/payment/callback?error=1`;

  const body = {
    NotificationOption: "LNK",
    InvoiceValue: Number(amount),
    CustomerName: customerName,
    DisplayCurrencyIso: currency,
    MobileCountryCode: "+965",
    CustomerMobile: mobile,
    CustomerEmail: customerEmail ?? undefined,
    CallBackUrl: callbackUrl || defaultCallback,
    ErrorUrl: errorUrl || defaultError,
    Language: "en",
    CustomerReference: orderId,
  };

  const resp = await fetch(`${MYFATOORAH_BASE}/v2/SendPayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data?.IsSuccess) {
    return json(
      {
        error: "MyFatoorah request failed",
        details: data?.Message ?? data,
      },
      502,
    );
  }

  return json({
    paymentUrl: data.Data?.InvoiceURL,
    invoiceId: data.Data?.InvoiceId,
  });
});
