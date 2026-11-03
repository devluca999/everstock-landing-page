/**
 * The site's automated emails, one source for both uses:
 *  - convex/mail.ts sends them (filling {{ variables }} itself), unless a SendPulse
 *    template id is set for that email, in which case SendPulse fills its stored copy;
 *  - scripts/sendpulse-templates.mjs uploads them to SendPulse as presets.
 * Look: the canonical V2 tokens (eBRAiN product_design, tokens/primitives.css + color.css,
 * Default light): eggshell page #FAF7F1, near-neutral raised card #FEFDFB, ink #1C1A17,
 * hairline rgba(70,66,59,.14), graphite button #16171B, jade stamp #08745A. Space Grotesk
 * with Arial fallback, Geist Mono labels with a monospace fallback. Table layout and inline
 * styles so Gmail, Outlook and Apple Mail render it the same.
 * Copy follows eBRAiN standards/quality-bar: no em or en dashes, no invented claims.
 */
const SITE = "https://tryeverstock.com";
const MARK = `${SITE}/email/everstock-mark.png`;
const SANS = "'Space Grotesk',Arial,Helvetica,sans-serif";
const MONO = "'Geist Mono',Menlo,Consolas,monospace";

export type EmailKey = "claimConfirmation" | "claimConfirmationDemo" | "accountReady";

export type EmailTemplate = {
  key: EmailKey;
  name: string; // the preset's name in SendPulse
  subject: string;
  preheader: string;
  variables: string[]; // {{ name }} placeholders the sender fills
  html: string;
  text: string;
};

const p = (s: string) => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.55;color:#1C1A17;">${s}</p>`;
const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td bgcolor="#16171B" style="border-radius:8px;">` +
  `<a href="${href}" style="display:inline-block;padding:14px 24px;font-family:${SANS};font-size:16px;font-weight:600;line-height:1;color:#FAF7F1;text-decoration:none;border-radius:8px;">${label}</a>` +
  `</td></tr></table>`;
const stamp = (label: string) =>
  `<span style="display:inline-block;padding:4px 9px;border:2px solid #08745A;border-radius:4px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#08745A;">${label}</span>`;

function layout({ preheader, eyebrow, title, body, stampLabel }: { preheader: string; eyebrow: string; title: string; body: string; stampLabel?: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#FAF7F1;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FAF7F1;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAF7F1" style="background:#FAF7F1;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 4px 20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;"><img src="${MARK}" width="40" height="25" alt="" style="display:block;border:0;"></td>
<td style="vertical-align:middle;padding-left:10px;font-family:${SANS};font-size:15px;font-weight:700;letter-spacing:0.16em;color:#1C1A17;">EVERSTOCK</td>
</tr></table>
</td></tr>
<tr><td bgcolor="#FEFDFB" style="background:#FEFDFB;border:1px solid rgba(70,66,59,0.14);border-radius:8px;padding:32px 28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${MONO};font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#635E55;padding-bottom:10px;">${eyebrow}</td>
${stampLabel ? `<td align="right" style="padding-bottom:10px;">${stamp(stampLabel)}</td>` : ""}
</tr></table>
<h1 style="margin:0 0 20px;padding-bottom:16px;border-bottom:1.5px solid #1C1A17;font-family:${SANS};font-size:26px;font-weight:600;line-height:1.2;letter-spacing:-0.02em;color:#1C1A17;">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#635E55;">
<em>Stay in stock, with Everstock.</em><br>
Everstock, Chicago IL · <a href="mailto:hello@tryeverstock.com" style="color:#635E55;">hello@tryeverstock.com</a> · <a href="${SITE}" style="color:#635E55;">tryeverstock.com</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

const SIGN_OFF = p("Luca M and Jordi B<br><span style=\"color:#635E55;\">Founders, Everstock</span>");
const REPLY = p("Anything you want us to know before then, like the suppliers you chase most or the paperwork that eats your week? Reply to this email. It comes straight to the founders.");

export const EMAILS: Record<EmailKey, EmailTemplate> = {
  claimConfirmation: {
    key: "claimConfirmation",
    name: "Everstock · Claim confirmation",
    subject: "You're in: founding pricing is locked",
    preheader: "We'll email you when your account is ready.",
    variables: ["first_name", "fit_line"],
    html: layout({
      preheader: "We'll email you when your account is ready.",
      eyebrow: "Founding cohort",
      title: "You're in, {{first_name}}.",
      stampLabel: "Claimed",
      body: p("Founding pricing is locked for you. We'll email you when your account is ready.") + p("{{fit_line}}") + REPLY + SIGN_OFF,
    }),
    text: [
      "Hi {{first_name}},",
      "",
      "You're in. Founding pricing is locked for you. We'll email you when your account is ready.",
      "",
      "{{fit_line}}",
      "",
      "Anything you want us to know before then, like the suppliers you chase most or the paperwork that eats your week? Reply to this email. It comes straight to the founders.",
      "",
      "Luca M and Jordi B",
      "Founders, Everstock",
      "https://tryeverstock.com",
    ].join("\n"),
  },
  claimConfirmationDemo: {
    key: "claimConfirmationDemo",
    name: "Everstock · Claim confirmation (20+ team, demo)",
    subject: "You're in: founding pricing is locked",
    preheader: "With a team your size, a 30 minute demo is the quickest way in.",
    variables: ["first_name", "demo_url"],
    html: layout({
      preheader: "With a team your size, a 30 minute demo is the quickest way in.",
      eyebrow: "Founding cohort",
      title: "You're in, {{first_name}}.",
      stampLabel: "Claimed",
      body:
        p("Founding pricing is locked for you. We'll email you when your account is ready.") +
        p("With a team your size, a 30 minute demo with the founders is the quickest way to see Everstock on your own paperwork.") +
        button("Book a demo", "{{demo_url}}") +
        SIGN_OFF,
    }),
    text: [
      "Hi {{first_name}},",
      "",
      "You're in. Founding pricing is locked for you. We'll email you when your account is ready.",
      "",
      "With a team your size, a 30 minute demo with the founders is the quickest way to see Everstock on your own paperwork. Book one here:",
      "{{demo_url}}",
      "",
      "Luca M and Jordi B",
      "Founders, Everstock",
      "https://tryeverstock.com",
    ].join("\n"),
  },
  accountReady: {
    key: "accountReady",
    name: "Everstock · Account ready (launch)",
    subject: "Your account is ready, start here",
    preheader: "Your founding pricing is already applied.",
    variables: ["first_name", "signup_url"],
    html: layout({
      preheader: "Your founding pricing is already applied.",
      eyebrow: "Founding cohort",
      title: "Your account is ready, {{first_name}}.",
      body:
        p("Everstock is live, and your founding pricing is already applied.") +
        button("Start here", "{{signup_url}}") +
        p("Questions along the way? Reply to this email. It comes straight to the founders.") +
        SIGN_OFF,
    }),
    text: [
      "Hi {{first_name}},",
      "",
      "Everstock is live, and your founding pricing is already applied. Start here:",
      "{{signup_url}}",
      "",
      "Questions along the way? Reply to this email. It comes straight to the founders.",
      "",
      "Luca M and Jordi B",
      "Founders, Everstock",
    ].join("\n"),
  },
};

/** Fill {{ variables }} (HTML-escaped in the html, raw in the text). */
export function fill(t: EmailTemplate, vars: Record<string, string>) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const sub = (s: string, html: boolean) => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => (html ? esc(vars[k] ?? "") : (vars[k] ?? "")));
  return { subject: sub(t.subject, false), html: sub(t.html, true), text: sub(t.text, false) };
}

/** The plan-fit sentence in the claim confirmation (claimConfirmation's {{fit_line}}). */
export function fitLine(planFit: string | undefined) {
  if (planFit === "Stockbot") return "From what you told us, stockbot fits a team your size: text it your paperwork and it catches what you'd miss.";
  if (planFit === "Base") return "From what you told us, Base fits a team your size: Everstock reads your inbox, so paperwork sorts itself.";
  if (planFit === "Base or Scale") return "From what you told us, Base or Scale fits a team your size. We'll help you pick when your account is ready.";
  return "We'll help you pick the right plan when your account is ready.";
}
