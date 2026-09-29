/** Inline, render-blocking script that sets data-theme before paint to avoid a flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('es-theme');document.documentElement.dataset.theme=(t==='light'?'light':'graphite');}catch(e){document.documentElement.dataset.theme='graphite';}})();`;

/**
 * Inline, render-blocking scroll policy. A refresh keeps your place (the browser's own
 * restore), but arriving any other way — typed URL, a link, back/forward, a bfcache
 * restore — always starts at the top. Anchor URLs keep their jump. The mode is stored
 * per history entry and survives reloads, so it is set explicitly both ways.
 */
export const scrollScript = `(function(){try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];var reload=n?n.type==='reload':!!(performance.navigation&&performance.navigation.type===1);if(location.hash)return;if('scrollRestoration' in history)history.scrollRestoration=reload?'auto':'manual';if(!reload){window.scrollTo(0,0);window.addEventListener('load',function(){window.scrollTo(0,0);},{once:true});}window.addEventListener('pageshow',function(e){if(e.persisted&&!location.hash)window.scrollTo(0,0);});}catch(e){}})();`;
