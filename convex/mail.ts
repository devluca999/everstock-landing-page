/**
 * Email through SendPulse's SMTP API (imported by the "use node" actions only).
 *
 * Env on the Convex deployment (SendPulse → Settings → API):
 *   SENDPULSE_API_KEY                         an API key (sp_apikey_…), sent as the Bearer token
 *   (or SENDPULSE_API_ID + SENDPULSE_API_SECRET, the older OAuth client pair)
 *   CLAIM_EMAIL_FROM                          "Name <address>", a sender verified in SendPulse
 *   SENDPULSE_TEMPLATE_CLAIM, SENDPULSE_TEMPLATE_CLAIM_DEMO, SENDPULSE_TEMPLATE_ACCOUNT_READY
 *                                            optional preset ids: when set, SendPulse sends its
 *                                            stored (and editable) copy; otherwise the copy in
 *                                            convex/emailTemplates.ts is sent
 * Without the credentials, `mailer()` returns null and nothing is sent.
 */
import { EMAILS, fill, type EmailKey } from "./emailTemplates";

const API = "https://api.sendpulse.com";

export type Mail = { to: string; subject: string; text: string; html?: string; from?: string };

/** SendPulse preset ids (scripts/sendpulse-templates.mjs prints them after upload). */
const TEMPLATE_ENV: Record<EmailKey, string> = {
  claimConfirmation: "SENDPULSE_TEMPLATE_CLAIM",
  claimConfirmationDemo: "SENDPULSE_TEMPLATE_CLAIM_DEMO",
  accountReady: "SENDPULSE_TEMPLATE_ACCOUNT_READY",
};

/** "Everstock <hello@tryeverstock.com>" → { name, email } */
function parseFrom(from: string) {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || "Everstock", email: m[2] } : { name: "Everstock", email: from.trim() };
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const toHtml = (text: string) =>
  `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.55;color:#16171B;">${escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, "<br>")}</div>`;

/**
 * A sender with one OAuth token (SendPulse tokens last an hour), or null when SendPulse
 * is not configured. `send` resolves true once SendPulse accepted the message.
 */
/** The Bearer token: the API key as is, or an OAuth token from the ID + Secret pair. */
async function sendpulseToken(): Promise<string | null> {
  const key = process.env.SENDPULSE_API_KEY;
  if (key) return key;
  const id = process.env.SENDPULSE_API_ID;
  const secret = process.env.SENDPULSE_API_SECRET;
  if (!id || !secret) return null;
  const auth = await fetch(`${API}/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  }).catch(() => null);
  const token = auth && auth.ok ? ((await auth.json()) as { access_token?: string }).access_token : undefined;
  if (!token) console.error("sendpulse auth failed", auth ? auth.status : "network");
  return token ?? null;
}

type Mailer = { send: (m: Mail) => Promise<boolean>; sendEmail: (key: EmailKey, to: string, vars: Record<string, string>) => Promise<boolean> };

export async function mailer(): Promise<Mailer | null> {
  const token = await sendpulseToken();
  const defaultFrom = process.env.CLAIM_EMAIL_FROM;
  if (!token) return null;
  const post = async (email: Record<string, unknown>) => {
    const r = await fetch(`${API}/smtp/emails`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    if (!r || !r.ok) {
      console.error("sendpulse send failed", r ? `${r.status} ${(await r.text()).slice(0, 200)}` : "network");
      return false;
    }
    return true;
  };
  const send = async ({ to, subject, text, html, from }: Mail) => {
    const sender = from ?? defaultFrom;
    if (!sender) return false;
    return post({
      subject,
      text,
      html: Buffer.from(html ?? toHtml(text), "utf8").toString("base64"), // SendPulse wants the HTML base64-encoded
      from: parseFrom(sender),
      to: [{ email: to }],
    });
  };
  const sendEmail = async (key: EmailKey, to: string, vars: Record<string, string>) => {
    const t = EMAILS[key];
    const id = Number(process.env[TEMPLATE_ENV[key]]);
    if (id && defaultFrom) {
      return post({ subject: fill(t, vars).subject, template: { id, variables: vars }, from: parseFrom(defaultFrom), to: [{ email: to }] });
    }
    const f = fill(t, vars);
    return send({ to, subject: f.subject, text: f.text, html: f.html });
  };
  return { send, sendEmail };
}
