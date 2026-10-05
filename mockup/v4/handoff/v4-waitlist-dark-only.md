# Everstock v4 · waitlist and demo CTAs, no Journey, graphite only (2026-10-02)

Apply these to `Everstock v4.dc.html`. The site already runs them (port patches in the repo, `scripts/port-patches/v4-waitlist-dark-only.mjs`, applied after every other v4 patch); once they are in this file, delete that module's entries so design and code stay one source. The module holds the exact find/replace pairs; this is the same list in words.

## CTAs
1. **Primary is "Join the waitlist".** Every "Book a demo" CTA (the stamped buttons in the nav, hero, Stakes, Before/After, Act 2 (twice), Why, Offer, footer and the phone bottom bar, the Act 2 bird banner, and the footer nav link) is relabelled "Join the waitlist", points at `#waitlist` and calls `openFounding`.
2. **Secondary is "Book a demo".** Every "Get early access" link (beside each primary, the Industries link, the Act 1 card link and bird banner, the footer nav link) is relabelled "Book a demo", points at `#book-demo` and calls `openDemo`.
3. **`openFounding` opens like `openDemo`:** prevent default, remember the focused element, close the phone menu, then `openLater(...)` with `plan: 'founding'` (the site does this in `components/v4/DcPage.jsx`).
4. **The modal:** no program picker (`accPicker: false`). For any plan other than demo: eyebrow "Founding partner access", title and submit "Join the waitlist", sent line "Request received for the founding partner waitlist."

## The closing records card becomes Book a demo
5. Title spans: "BOOK A DEMO" / "30 MINUTES WITH THE FOUNDERS" (were "SEND US YOUR" / "SCATTERED RECORDS").
6. Remove the "Upload files" row (file picker and file name).
7. Stamp button "BOOK A DEMO" (was "SEND RECORDS"); sent line "Got it. We'll be in touch." with the ink RECEIVED stamp. On submit the site opens the booking link, or the demo modal with the email prefilled.
8. Remove the footer nav's "Upload your documents" link (it would be a second Book a demo).

## Journey removed
9. Remove the "Journey" links (desktop nav, phone menu, footer nav) and both "Walk the full journey →" links in Act 2. The site redirects `/journey` to `/`.

## Graphite only
10. Remove the desktop nav's theme button and the phone menu's "Theme" row. The site always sets `data-theme="graphite"`.
