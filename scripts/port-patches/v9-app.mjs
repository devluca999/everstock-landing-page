// v9 home: links into the app at app.tryeverstock.com (Luca, 2026-10-31).
// The links ship hidden. app/layout.tsx shows them once NEXT_PUBLIC_APP_LIVE=1 is set
// on Vercel, so nobody lands on the app's 404 before Jordi's prod deploy (roadmap P0.7).
// Same rules as the other patch modules: each anchor must match its count exactly.
const APP = "https://app.tryeverstock.com";
export const logicPatches = [];
export const templatePatches = [
  {
    why: "App links: 'Sign in' sits just left of the nav's Get early access button, at every width (hidden until the app is live)",
    find: /<a href="#waitlist" onClick="\{\{ openFounding \}\}" data-cta="nav"/g,
    count: 1,
    replace: (m) =>
      `<a href="${APP}/sign-in" data-app-link="sign-in" style="align-items:center;min-height:44px;font-size:14px;font-weight:500;color:rgb(var(--ink) / 0.72);white-space:nowrap;" style-hover="color:rgb(var(--ink));">Sign in</a>\n      ` +
      m,
  },
];
