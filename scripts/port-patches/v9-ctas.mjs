// v9 home page: a clearly visible call to action in every section, built from one recipe
// (scripts/port-patches/cta.mjs). Luca, 2026-10-30: "every section should have a CTA ... just
// make sure every section has a CTA that's clearly visible ... make the CTAs also match properly".
// Runs after the other area modules (it is last in V9_AREAS), so its anchors are the text they leave.
import { stampedCta, textCta, ctaRow, STAMP_KEYS } from "./cta.mjs";

export const logicPatches = [
  {
    why: "CTAs: the new buttons' APPROVED stamps (Example week, Problem, Workflows, Industries, the three tiers, the footer's Stock Plan link) land on hover like the others",
    find: "...['nav','hero','foot','bar','ba','a2','plan','offer','stk','why','prs','prb','prc','pre'].reduce(",
    replace: "...['nav','hero','foot','bar','ba','a2','plan','offer','stk','why','prs','prb','prc','pre'," + STAMP_KEYS.map((k) => `'${k}'`).join(",") + "].reduce(",
  },
];

export const templatePatches = [
  {
    why: "CTAs › Problem: the section ends on what to do about it: 'Get a free Stock Plan' (opens the Stock Plan) and 'Book a demo'",
    find: /(<ul aria-label="Proof"[\s\S]*?<\/ul>)/g,
    count: 1,
    replace: (ul) => ul + ctaRow(stampedCta({ key: "prob", to: "plan", label: "Get a free Stock Plan" }), textCta({ to: "demo", label: "Book a demo" }), "margin-top:18px;"),
  },
  {
    why: "CTAs › Industries: 'Book a demo' under the box is the page's primary button, so it stands out (it was a pale pill)",
    find: /<a href="#book-demo" onClick="\{\{ openDemo \}\}" style="position:absolute;left:50%;top:calc\(100% \+ clamp\(10px,2svh,20px\)\);[^"]*" style-hover="[^"]*">Book a demo<\/a>/g,
    count: 1,
    replace: () => `<div style="position:absolute;left:50%;top:calc(100% + clamp(14px,2.4svh,24px));transform:translateX(-50%);z-index:4;">${stampedCta({ key: "ind", to: "demo", label: "Book a demo" })}</div>`,
  },
  {
    why: "CTAs › Footer: a third way in under the two buttons, 'Get a free Stock Plan' (no call needed)",
    find: />Book a demo<\/a><\/div>\n( *)<div ref="\{\{ stackRef \}\}"/g,
    count: 1,
    replace: (_m, ind) => `>Book a demo</a>${textCta({ to: "plan", label: "Or get a free Stock Plan →", style: "font-weight:500;color:rgb(var(--ink) / 0.8);" })}</div>\n${ind}<div ref="{{ stackRef }}"`,
  },
];
