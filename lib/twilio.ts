import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!accountSid || !authToken) throw new Error("Twilio not configured");
  if (!client) client = twilio(accountSid, authToken);
  return client;
}

export async function sendOtp(phone: string) {
  if (!verifyServiceSid) throw new Error("TWILIO_VERIFY_SERVICE_SID not set");
  return getClient()
    .verify.v2.services(verifyServiceSid)
    .verifications.create({ to: phone, channel: "sms" });
}

export async function checkOtp(phone: string, code: string) {
  if (!verifyServiceSid) throw new Error("TWILIO_VERIFY_SERVICE_SID not set");
  const result = await getClient()
    .verify.v2.services(verifyServiceSid)
    .verificationChecks.create({ to: phone, code });
  return result.status === "approved";
}

export function isTwilioConfigured() {
  return Boolean(accountSid && authToken && verifyServiceSid);
}
