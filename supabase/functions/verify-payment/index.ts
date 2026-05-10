// Supabase Edge Function: verify-payment
// Verifies a MyFatoorah payment via /v2/getPaymentStatus.
//
// Request body: { paymentId }
// Response: { paid: boolean, status, invoiceId, orderId, amount, currency, raw }
//
// Secret required: MYFATOORAH_API_KEY

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

  const { paymentId, keyType = "PaymentId" } = payload ?? {};
  if (!paymentId) return json({ error: "paymentId is required" }, 400);

  const resp = await fetch(`${MYFATOORAH_BASE}/v2/getPaymentStatus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ Key: paymentId, KeyType: keyType }),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data?.IsSuccess) {
    return json(
      { error: "MyFatoorah verification failed", details: data?.Message ?? data },
      502,
    );
  }

  const d = data.Data ?? {};
  const status = d.InvoiceStatus as string | undefined;
  const paid = status === "Paid";

  return json({
    paid,
    status,
    invoiceId: d.InvoiceId,
    orderId: d.CustomerReference,
    amount: d.InvoiceValue,
    currency: d.InvoiceDisplayValue,
    raw: d,
  });
});
