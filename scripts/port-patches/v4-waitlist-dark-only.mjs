/**
 * v4, 2026-10-02 (Luca): the CTAs become "Join the waitlist" (primary, founding partner
 * access) and "Book a demo" (secondary); the closing "Send us your scattered records"
 * card becomes a Book a demo card (no file upload); the Journey page is gone; the site is graphite
 * only, with no theme switch. Applied by scripts/port-dc.mjs at port time, after every
 * other v4 template patch (the anchors below are the already-patched labels). The same
 * pairs are the change list for the Claude Design v4 file.
 */

export const logicPatches = [
  {
    why: "Request modal: both non-demo modes are the founding partner waitlist",
    find: "accTitle: this.state.plan === 'demo' ? 'Book a demo' : this.state.plan === 'founding' ? 'Founding partner' : 'Get early access',",
    replace: "accTitle: this.state.plan === 'demo' ? 'Book a demo' : 'Join the waitlist',",
  },
  {
    why: "(same) no program picker (early access is no longer offered on its own), and the submit carries the CTA label",
    find: "accPicker: this.state.plan !== 'demo', accSubmit: this.state.plan === 'demo' ? 'Book a demo' : 'Get early access',",
    replace: "accPicker: false, accSubmit: this.state.plan === 'demo' ? 'Book a demo' : 'Join the waitlist',",
  },
  {
    why: "(same) the eyebrow",
    find: "accEyebrow: this.state.plan === 'demo' ? '30 minutes with the founders' : this.state.plan === 'founding' ? 'Founding partner program' : 'Early access',",
    replace: "accEyebrow: this.state.plan === 'demo' ? '30 minutes with the founders' : 'Founding partner access',",
  },
  {
    why: "(same) the sent line: \"Request received for the founding partner waitlist.\"",
    find: "accPlanName: this.state.plan === 'demo' ? 'a demo' : this.state.plan === 'founding' ? 'the founding partner program' : 'early access',",
    replace: "accPlanName: this.state.plan === 'demo' ? 'a demo' : 'the founding partner waitlist',",
  },
];

export const templatePatches = [
  /* ----- CTAs: the primary (was Book a demo) joins the waitlist ----- */
  {
    why: "Primary CTA destination: every 'Book a demo' link (the stamped buttons, the Act 2 bird banner, the footer nav link) opens the founding partner waitlist",
    find: 'href="#book-demo" onClick="{{ openDemo }}"',
    count: 12,
    replace: 'href="#waitlist" onClick="{{ openFounding }}"',
  },
  {
    why: "(same) the phone bottom bar's button",
    find: 'onClick="{{ openDemo }}" data-cta="bar"',
    replace: 'onClick="{{ openFounding }}" data-cta="bar"',
  },
  {
    why: "Primary CTA label",
    find: ">Book a demo<",
    count: 13,
    replace: ">Join the waitlist<",
  },
  /* ----- CTAs: the secondary (was Get early access) books a demo ----- */
  {
    why: "Secondary CTA destination: every 'Get early access' link books a demo",
    find: 'href="#access" onClick="{{ openAccess }}"',
    count: 11,
    replace: 'href="#book-demo" onClick="{{ openDemo }}"',
  },
  {
    why: "Secondary CTA label",
    find: ">Get early access<",
    count: 11,
    replace: ">Book a demo<",
  },
  /* ----- the records CTA becomes Book a demo (records are not taken yet) ----- */
  {
    why: "Footer nav: 'Send us your scattered records' would now be a second 'Book a demo' beside the one already there, so it goes",
    find: /\n *<a href="#price-file" onClick="\{\{ goPF \}\}"[^\n]*>Send us your scattered records<\/a>/g,
    count: 1,
    replace: "",
  },
  {
    why: "Closing card: its title reads Book a demo",
    find: '<span data-ttl="true" style="white-space:nowrap;">SEND US YOUR</span><span data-ttl="true" style="white-space:nowrap;">SCATTERED RECORDS</span>',
    replace: '<span data-ttl="true" style="white-space:nowrap;">BOOK A DEMO</span><span data-ttl="true" style="white-space:nowrap;">30 MINUTES WITH THE FOUNDERS</span>',
  },
  {
    why: "(same) no file upload: the card only takes the email",
    find: /\n *<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin-top:8px;">\n[^\n]*>Upload files<\/span>[\s\S]*?\n *<\/label>\n *<\/div>/g,
    count: 1,
    replace: "",
  },
  {
    why: "(same) the stamp button",
    find: ">SEND RECORDS</button>",
    replace: ">BOOK A DEMO</button>",
  },
  {
    why: "(same) the sent line (the demo form or the booking link opens on submit)",
    find: "Got it. Add your company and we'll be in touch.",
    replace: "Got it. We'll be in touch.",
  },
  /* ----- Journey page removed ----- */
  {
    why: "Journey links: desktop nav, phone menu, footer nav",
    find: /\n *<a href="\/journey"[^\n]*>Journey<\/a>/g,
    count: 3,
    replace: "",
  },
  {
    why: "(same) Act 2's 'Walk the full journey' link beside the CTA",
    find: /(\n *)?<a href="\/journey"[^\n]*?>Walk the full journey →<\/a>/g,
    count: 2,
    replace: "",
  },
  /* ----- graphite only ----- */
  {
    why: "No theme switch: the desktop nav's Light / Dark button",
    find: /\n *<sc-if value="\{\{ wide \}\}"[^\n]*><button type="button" onClick="\{\{ toggleTheme \}\}"[^\n]*<\/button><\/sc-if>/g,
    count: 1,
    replace: "",
  },
  {
    why: "(same) the phone menu's Theme row",
    find: /\n *<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:60px;">\n[^\n]*>Theme<\/span>\n[^\n]*onClick="\{\{ toggleTheme \}\}"[^\n]*\n *<\/div>/g,
    count: 1,
    replace: "",
  },
];
