// /pricing FAQ: the loading mark, rebuilt (Luca, 2026-11-01: "the beam has a split path along the
// same track ... missing texture and layering ... not as premium as the design system").
//
// What was wrong in the design's version:
// - the beam sat in a clipPath made of a *stroked* path, but clip paths only use fill geometry, so
//   the beam was cut to the inside of each lobe: half the stroke lit, the other half chrome, which
//   read as a second, thinner path on the same track. The beam now sits in a mask (masks keep the
//   stroke), so it fills the loop's whole cross-section, as the design system's beam rules say.
// - fifteen dash layers ran on one 2.1s loop that was out of step with the 6.4s unify/gate cycle,
//   so the beam faded in and out mid-lap. Now every beam layer shares one keyframe set per cycle:
//   the beam starts at the crossing as the loop unifies, makes one eased lap, and leaves as it
//   segments again. All layers share the same leading edge, so it is one beam with a soft tail.
// - the chrome's highlight stack drew as hard concentric rings. The highlights are softened, a
//   fine grain (the live mark's feTurbulence recipe, assets/logo-live-*.svg) sits over the metal,
//   and the metal's sheen and lower shading are laid back over the beam, so it reads as the tube
//   lighting up rather than paint on top of it.
// Reduced motion keeps the design's behaviour: no beam, the segmented mark with its active glow.

const P = "M32 20C28 12 22 8 16 8C8 8 3 13 3 20C3 27 8 32 16 32C22 32 28 28 32 20C36 12 42 8 48 8C56 8 61 13 61 20C61 27 56 32 48 32C42 32 36 28 32 20Z";
const path = (attrs) => `<path d="${P}" fill="none" ${attrs}></path>`;
const SEG = 'pathLength="100" stroke-linecap="butt" stroke-linejoin="miter" stroke-dasharray="6.63 1.7" style="animation:{{ mkUnify }};"';

// One travel keyframe per dash length (and how far it trails the head), all sharing one timeline:
// the dash's leading edge goes 0 -> 100 along the loop between 24% and 78% of the 6.4s cycle.
const travel = [];
const kf = (len, back = 0) => {
  const name = `MkB${String(len).replace(".", "_")}b${String(back).replace(".", "_")}`;
  if (!travel.find((t) => t.name === name)) travel.push({ name, len, back });
  return `style="animation:{{ mk_${name} }};"`;
};
const dash = (len) => `stroke-dasharray="${len} ${100 - len}"`;

// tail: long faint dashes to short bright ones, all ending at the head
const TAIL = [
  [36, 0.07], [26, 0.1], [18, 0.15], [12, 0.22], [8, 0.32], [5, 0.48], [3, 0.7],
];

const SVG = `<svg viewBox="-6 -6 76 56" width="100%" shape-rendering="geometricPrecision" color-interpolation-filters="sRGB" style="display:block;overflow:visible;filter:{{ mkReduced }};">
            <defs>
              <linearGradient id="mkg" x1="0.08" y1="0" x2="0.92" y2="1"><stop offset="0" stop-color="#3C4048"></stop><stop offset=".167" stop-color="#D9E0EB"></stop><stop offset=".333" stop-color="#24262C"></stop><stop offset=".5" stop-color="#AEB7C5"></stop><stop offset=".667" stop-color="#2C2F36"></stop><stop offset=".833" stop-color="#CCD4E1"></stop><stop offset="1" stop-color="#383C44"></stop></linearGradient>
              <linearGradient id="mks" x1="0.05" y1="0" x2="0.78" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"></stop><stop offset=".20" stop-color="#fff" stop-opacity=".28"></stop><stop offset=".46" stop-color="#fff" stop-opacity="0"></stop><stop offset=".74" stop-color="#fff" stop-opacity=".5"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient>
              <linearGradient id="mko" x1="0.05" y1="0" x2="0.78" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"></stop><stop offset=".38" stop-color="#fff" stop-opacity=".8"></stop><stop offset=".6" stop-color="#fff" stop-opacity="0"></stop><stop offset=".92" stop-color="#fff" stop-opacity=".65"></stop></linearGradient>
              <linearGradient id="mktop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"></stop><stop offset=".42" stop-color="#fff" stop-opacity=".55"></stop><stop offset=".6" stop-color="#fff" stop-opacity="0"></stop></linearGradient>
              <linearGradient id="mkbot" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#fff" stop-opacity="0"></stop><stop offset=".8" stop-color="#fff" stop-opacity=".7"></stop><stop offset="1" stop-color="#fff" stop-opacity="1"></stop></linearGradient>
              <linearGradient id="mksh" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="-8" y2="40"><stop offset="0" stop-color="#fff" stop-opacity="0"></stop><stop offset=".5" stop-color="#fff" stop-opacity=".9"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop><animateTransform attributeName="gradientTransform" type="translate" values="0 0;0 0;112 0;112 0" keyTimes="0;0.3;0.62;1" dur="6.4s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.45 0 .55 1;0 0 1 1"></animateTransform></linearGradient>
              <radialGradient id="mkfloor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#23262D" stop-opacity=".22"></stop><stop offset=".6" stop-color="#23262D" stop-opacity=".08"></stop><stop offset="1" stop-color="#23262D" stop-opacity="0"></stop></radialGradient>
              <mask id="mkms" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56"><rect width="64" height="40" fill="url(#mks)"></rect></mask>
              <mask id="mkmo" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56"><rect width="64" height="40" fill="url(#mko)"></rect></mask>
              <mask id="mkmt" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56"><rect y="5" width="64" height="30" fill="url(#mktop)"></rect></mask>
              <mask id="mkmb" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56"><rect y="5" width="64" height="30" fill="url(#mkbot)"></rect></mask>
              <mask id="mkmsh" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56"><rect x="-6" y="-6" width="76" height="56" fill="url(#mksh)"></rect></mask>
              <mask id="mkloop" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="56">${path('stroke="#fff" stroke-width="5.6" stroke-linejoin="round"')}</mask>
              <filter id="mkhalo" filterUnits="userSpaceOnUse" x="-12" y="-12" width="88" height="68"><feGaussianBlur stdDeviation="1.9"></feGaussianBlur></filter>
              <filter id="mkglow" filterUnits="userSpaceOnUse" x="-14" y="-14" width="92" height="72"><feGaussianBlur stdDeviation="2.6"></feGaussianBlur></filter>
              <filter id="mkbloom" filterUnits="userSpaceOnUse" x="-16" y="-16" width="96" height="76"><feGaussianBlur stdDeviation="4.6"></feGaussianBlur></filter>
              <filter id="mksoft" filterUnits="userSpaceOnUse" x="-12" y="-12" width="88" height="68"><feGaussianBlur stdDeviation="0.4"></feGaussianBlur></filter>
              <filter id="mkspec" filterUnits="userSpaceOnUse" x="-12" y="-12" width="88" height="68"><feGaussianBlur stdDeviation="0.16"></feGaussianBlur></filter>
              <filter id="mktail" filterUnits="userSpaceOnUse" x="-12" y="-12" width="88" height="68"><feGaussianBlur stdDeviation="0.85"></feGaussianBlur></filter>
              <filter id="mkgrain" filterUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="56"><feTurbulence type="fractalNoise" baseFrequency="2.8" numOctaves="2" seed="7" stitchTiles="stitch" result="n"></feTurbulence><feColorMatrix in="n" type="saturate" values="0" result="g"></feColorMatrix><feComponentTransfer in="g" result="c"><feFuncR type="linear" slope="1.3" intercept="-0.15"></feFuncR><feFuncG type="linear" slope="1.3" intercept="-0.15"></feFuncG><feFuncB type="linear" slope="1.3" intercept="-0.15"></feFuncB></feComponentTransfer><feComposite in="c" in2="SourceGraphic" operator="in"></feComposite></filter>
            </defs>
            <ellipse cx="32" cy="43.5" rx="30" ry="2.6" fill="url(#mkfloor)"></ellipse>
            ${path('stroke="#23262D" stroke-opacity=".22" stroke-width="7.4" stroke-linejoin="round" filter="url(#mkhalo)"')}
            ${path(`${SEG} stroke-width="6.1" stroke="#1B1D22" opacity=".55"`)}
            ${path(`${SEG} stroke-width="5.6" stroke="url(#mkg)"`)}
            ${path(`${SEG} stroke-width="5.6" mask="url(#mkmo)" stroke="#191B20" opacity=".42"`)}
            ${path(`${SEG} stroke-width="5.6" mask="url(#mkmb)" stroke="#14161A" opacity=".3"`)}
            ${path(`${SEG} stroke-width="3.4" mask="url(#mkmt)" stroke="#EEF3FB" opacity=".26" filter="url(#mksoft)"`)}
            <g>
              ${path(`${SEG} stroke-width="2.2" mask="url(#mkms)" stroke="#C9D4E6" opacity=".9" filter="url(#mkspec)"`)}
              ${path(`${SEG} stroke-width="0.9" mask="url(#mkms)" stroke="#F4F8FF" opacity=".85"`)}
              ${path(`${SEG} stroke-width="0.35" mask="url(#mkms)" stroke="#FFFFFF" opacity=".9" transform="translate(0 -0.35)"`)}
            </g>
            ${path(`${SEG.replace("animation:{{ mkUnify }};", "animation:{{ mkUnify }};mix-blend-mode:soft-light;")} stroke-width="5.6" stroke="#808080" opacity=".3" filter="url(#mkgrain)"`)}
            <g style="opacity:0;animation:{{ mkGate }};">
              ${path('stroke-width="5.6" mask="url(#mkmsh)" stroke="#FFFFFF" opacity=".45"')}
              ${path(`pathLength="100" stroke-linecap="round" stroke="#2C7BE8" stroke-opacity=".2" stroke-width="13" ${dash(22)} filter="url(#mkbloom)" ${kf(22)}`)}
              ${path(`pathLength="100" stroke-linecap="round" stroke="#2C7BE8" stroke-opacity=".3" stroke-width="8.5" ${dash(12)} filter="url(#mkglow)" ${kf(12)}`)}
              <g mask="url(#mkloop)">
                <g filter="url(#mktail)">
                  ${TAIL.map(([len, op]) => path(`pathLength="100" stroke-linecap="butt" stroke="#0B5FD0" stroke-opacity="${op}" stroke-width="7" ${dash(len)} ${kf(len)}`)).join("\n                  ")}
                  ${path(`pathLength="100" stroke-linecap="round" stroke="#1F74F0" stroke-width="6" ${dash(4)} ${kf(4, 1.4)}`)}
                </g>
                ${path(`pathLength="100" stroke-linecap="round" stroke="#2F80F5" stroke-width="5" ${dash(5)} filter="url(#mksoft)" ${kf(5, 1.6)}`)}
                ${path(`pathLength="100" stroke-linecap="round" stroke="#6FA6FF" stroke-width="3.2" ${dash(4)} filter="url(#mksoft)" ${kf(4, 1.9)}`)}
                ${path(`pathLength="100" stroke-linecap="round" stroke="#D6E6FF" stroke-opacity=".8" stroke-width="1.5" ${dash(4.5)} filter="url(#mksoft)" ${kf(4.5, 2.2)}`)}
                ${path(`pathLength="100" stroke-linecap="butt" stroke-width="5.6" mask="url(#mkmb)" stroke="#0A1A33" stroke-opacity=".38" filter="url(#mktail)" ${dash(30)} ${kf(30, 1.6)}`)}
                ${path(`pathLength="100" stroke-linecap="butt" stroke-width="2.2" mask="url(#mkms)" stroke="#E6F0FF" stroke-opacity=".5" filter="url(#mksoft)" ${dash(14)} ${kf(14, 1.8)}`)}
              </g>
            </g>
          </svg>`;

export const templatePatches = [
  {
    why: "Pricing FAQ mark: one full-width beam in a stroke mask (the design's stroked clipPath kept only the inner half), one lap per unify cycle, softened chrome highlights, grain, sheen over the beam",
    find: /<svg viewBox="-6 -6 76 56"[\s\S]*?<\/svg>/,
    replace: SVG,
  },
];

const NAMES = travel.map((t) => t.name);
export const logicPatches = [
  {
    why: "Pricing FAQ mark: the beam layers' animations (one per dash length, all on the 6.4s cycle; easing lives in the keyframes)",
    find: "...[40,32,25,19,18,14,13,10,7,5,4,3,2,'W','G'].reduce((o, L) => { o['mkT' + L] = red ? 'none' : 'esMk' + L + ' 2.1s cubic-bezier(.55,.05,.45,.95) infinite'; return o; }, {}),",
    replace: `...${JSON.stringify(NAMES)}.reduce((o, n) => { o['mk_' + n] = red ? 'none' : 'es' + n + ' 6.4s linear infinite'; return o; }, {}),`,
  },
];

// the lap: leading edge at the crossing (0) until 24%, eased once round to 100 by 78%, then held
// while the gate fades it out. Each layer's dash ends `back` behind the head.
const EASE = "cubic-bezier(.62,0,.28,1)";
const travelCss = travel
  .map(({ name, len, back }) => {
    const a = len + back, b = len + back - 100;
    return `@keyframes es${name}{0%,24%{stroke-dashoffset:${a};animation-timing-function:${EASE}}78%,100%{stroke-dashoffset:${b}}}`;
  })
  .join("\n");

export const helmetPatches = [
  {
    why: "Pricing FAQ mark: gate and unify retimed so the beam shows only while the loop is solid",
    find: "@keyframes esMkGate{0%,22%{opacity:0}30%,72%{opacity:1}80%,100%{opacity:0}}\n@keyframes esUnify{0%,6%{stroke-dasharray:6.63 1.7}18%,80%{stroke-dasharray:100 0}92%,100%{stroke-dasharray:6.63 1.7}}",
    replace:
      "@keyframes esMkGate{0%,17%{opacity:0}24%,77%{opacity:1}84%,100%{opacity:0}}\n@keyframes esUnify{0%,6%{stroke-dasharray:6.63 1.7}16%,82%{stroke-dasharray:100 0}94%,100%{stroke-dasharray:6.63 1.7}}\n" +
      travelCss,
  },
];
