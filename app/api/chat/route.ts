import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the booking assistant for Pitch Booking Kuwait, a football pitch reservation site.

Help users with:
- Finding available pitches (grass, turf, indoor) and prices in KWD
- How to book: pick a pitch, choose date/time slot, enter name + phone, verify phone via OTP, pay with card via Stripe
- Cancellation, payment, and arrival questions

Keep replies short (2-4 sentences). Reply in the same language the user wrote in (Arabic or English). If you don't know a specific detail (exact availability, prices for a specific day, account-specific data), tell the user to check the Pitches page or contact admin.`;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "NOT_CONFIGURED" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "BAD_REQUEST" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": req.nextUrl.origin,
      "X-Title": "Pitch Booking Kuwait",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-20),
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "UPSTREAM_ERROR", detail: text.slice(0, 300) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content as string | undefined;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore non-JSON keepalives
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
