#!/usr/bin/env node
/**
 * The site's automated emails (convex/emailTemplates.ts) as SendPulse presets.
 *
 *   node scripts/sendpulse-templates.mjs --preview=<dir>   write each email as HTML, filled
 *                                                          with sample values, to look at
 *   node scripts/sendpulse-templates.mjs --upload          create (or update) the presets in
 *                                                          SendPulse and print their ids
 *
 * --upload reads SENDPULSE_API_ID / SENDPULSE_API_SECRET from the environment (e.g.
 * `set -a; . ./.env.local; set +a` first). It keeps the preset ids in
 * scripts/sendpulse-templates.json, so a second run updates the same presets. Set the ids on
 * each Convex deployment as SENDPULSE_TEMPLATE_CLAIM, SENDPULSE_TEMPLATE_CLAIM_DEMO and
 * SENDPULSE_TEMPLATE_ACCOUNT_READY so SendPulse sends its stored copy.
 * Templates are per SendPulse account, not per deployment, so there is no --env here.
 */
import fs from "node:fs";
import path from "node:path";
import { EMAILS, fill, fitLine } from "../convex/emailTemplates.ts";

const API = "https://api.sendpulse.com";
const IDS = path.join(path.dirname(new URL(import.meta.url).pathname), "sendpulse-templates.json");
const ENV = { claimConfirmation: "SENDPULSE_TEMPLATE_CLAIM", claimConfirmationDemo: "SENDPULSE_TEMPLATE_CLAIM_DEMO", accountReady: "SENDPULSE_TEMPLATE_ACCOUNT_READY" };
const SAMPLE = {
  claimConfirmation: { first_name: "Dana", fit_line: fitLine("Base") },
  claimConfirmationDemo: { first_name: "Dana", demo_url: "https://tryeverstock.com/#book-demo" },
  accountReady: { first_name: "Dana", signup_url: "https://app.tryeverstock.com/sign-up?founding=1" },
};

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}`))?.split("=")[1];

if (process.argv.some((a) => a.startsWith("--preview"))) {
  const dir = arg("preview") || "email-previews";
  fs.mkdirSync(dir, { recursive: true });
  for (const t of Object.values(EMAILS)) {
    const f = fill(t, SAMPLE[t.key]);
    fs.writeFileSync(path.join(dir, `${t.key}.html`), f.html);
    console.log(`${t.key}: "${f.subject}" → ${path.join(dir, t.key + ".html")}`);
  }
} else if (process.argv.includes("--upload")) {
  const { SENDPULSE_API_ID: id, SENDPULSE_API_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error("Set SENDPULSE_API_ID and SENDPULSE_API_SECRET first.");
  const auth = await fetch(`${API}/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  }).then((r) => r.json());
  if (!auth.access_token) throw new Error(`SendPulse refused the credentials: ${auth.message || auth.error}`);
  const headers = { authorization: `Bearer ${auth.access_token}`, "content-type": "application/json" };
  const ids = fs.existsSync(IDS) ? JSON.parse(fs.readFileSync(IDS, "utf8")) : {};
  for (const t of Object.values(EMAILS)) {
    const body = Buffer.from(t.html, "utf8").toString("base64");
    const existing = ids[t.key];
    const res = existing
      ? await fetch(`${API}/template/edit/${existing}`, { method: "POST", headers, body: JSON.stringify({ body, lang: "en" }) })
      : await fetch(`${API}/template`, { method: "POST", headers, body: JSON.stringify({ name: t.name, body, lang: "en" }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.result === false) {
      console.error(`${t.key}: failed (${res.status}) ${JSON.stringify(j).slice(0, 200)}`);
      continue;
    }
    ids[t.key] = existing || j.real_id || j.id;
    console.log(`${t.key}: ${existing ? "updated" : "created"} "${t.name}", id ${ids[t.key]} → ${ENV[t.key]}`);
  }
  fs.writeFileSync(IDS, JSON.stringify(ids, null, 2) + "\n");
} else {
  console.error("usage: node scripts/sendpulse-templates.mjs --preview=<dir> | --upload");
  process.exit(1);
}
