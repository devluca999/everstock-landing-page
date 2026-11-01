/**
 * Inline, render-blocking script that sets data-theme before paint. The site is graphite
 * only (2026-10-02): there is no theme switch, and a light choice stored by the old
 * switch is cleared so it can never apply.
 */
export const themeScript = `(function(){document.documentElement.dataset.theme='graphite';try{localStorage.removeItem('es-theme');}catch(e){}})();`;

/**
 * Inline, render-blocking scroll policy. A refresh keeps your place (the browser's own
 * restore), but arriving any other way — typed URL, a link, back/forward, a bfcache
 * restore — always starts at the top. Anchor URLs keep their jump. The mode is stored
 * per history entry and survives reloads, so it is set explicitly both ways.
 */
export const scrollScript = `(function(){try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];var reload=n?n.type==='reload':!!(performance.navigation&&performance.navigation.type===1);if(location.hash)return;if('scrollRestoration' in history)history.scrollRestoration=reload?'auto':'manual';if(!reload){window.scrollTo(0,0);window.addEventListener('load',function(){window.scrollTo(0,0);},{once:true});}window.addEventListener('pageshow',function(e){if(e.persisted&&!location.hash)window.scrollTo(0,0);});}catch(e){}})();`;

/**
 * App links and rep referrals (2026-10-31). `[data-app-link]` elements (Sign in) stay hidden
 * until NEXT_PUBLIC_APP_LIVE=1, so nobody lands on app.tryeverstock.com before it is deployed.
 * A `?ref=CODE` on any landing URL is kept in the `es_ref` cookie on the root domain for 90
 * days, so the app's sign-up can credit the eDialer rep (eBRAiN specs/rep-referral-attribution).
 */
export const appScript = (live: boolean) =>
  `(function(){try{${live ? "document.documentElement.setAttribute('data-app-live','');" : ""}var r=new URLSearchParams(location.search).get('ref');if(r&&/^[A-Za-z0-9-]{3,24}$/.test(r)){var d=/(^|\\.)tryeverstock\\.com$/.test(location.hostname)?';domain=.tryeverstock.com':'';document.cookie='es_ref='+r.toUpperCase()+d+';path=/;max-age=7776000;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');}}catch(e){}})();`;

export const appLinkCss = `[data-app-link]{display:none!important}html[data-app-live] [data-app-link]{display:inline-flex!important}`;
