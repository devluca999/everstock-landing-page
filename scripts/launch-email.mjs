#!/usr/bin/env node
/**
 * Launch day: email every prelaunch claimer "Your account is ready, start here."
 *
 *   node scripts/launch-email.mjs --env=dev|prod            dry run: counts who would get it
 *   node scripts/launch-email.mjs --env=prod --send         sends (each person once)
 *   ... --limit=5                                           only the first N
 *
 * The environment is never assumed: --env is required. Runs convex/launch.ts
 * `emailClaimers` on that deployment, which needs SIGNUP_URL, CLAIM_EMAIL_FROM and
 * RESEND_API_KEY in its Convex env. Flip LAUNCH_MODE=live on Vercel first.
 */
import { spawnSync } from "node:child_process";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const env = arg("env");
if (env !== "dev" && env !== "prod") {
  console.error("usage: node scripts/launch-email.mjs --env=dev|prod [--send] [--limit=N]");
  process.exit(1);
}
const send = process.argv.includes("--send");
const limit = arg("limit") ? Number(arg("limit")) : undefined;
const DEPLOYMENTS = { dev: "dev:grateful-gnat-66", prod: "prod:tremendous-panda-630" };

const payload = JSON.stringify({ send, ...(limit ? { limit } : {}) });
console.log(`${send ? "SENDING" : "Dry run"} on ${env} (${DEPLOYMENTS[env]})`);
const r = spawnSync("npx", ["convex", "run", "launch:emailClaimers", payload], {
  stdio: "inherit",
  env: { ...process.env, CONVEX_DEPLOYMENT: DEPLOYMENTS[env] },
});
process.exit(r.status ?? 1);
