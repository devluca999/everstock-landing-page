// /pricing billing terms (2026-11-03): every price on the page comes from lib/pricing.config.ts
// through the host (components/pricing/DcPage.jsx: tierHeader, scenePrice, pricingText). The
// design's class fields run in its constructor, so these call prototype methods the host
// subclass defines, with the design's own value as the fallback if a method is missing.
export const logicPatches = [
  {
    why: "Pricing config: the compare table's tier prices",
    find: "{ n: 'stockbot', p: '$20', per: '/mo', cta: 'Claim your spot' },",
    replace: "{ n: 'stockbot', ...(this.tierHeader ? this.tierHeader('stockbot') : { p: '$20', per: '/mo' }), cta: 'Claim your spot' },",
  },
  {
    why: "Pricing config: the compare table's tier prices (Base)",
    find: "{ n: 'Base', pre: 'From', p: '$199', per: '/mo', cta: 'Claim your spot' },",
    replace: "{ n: 'Base', ...(this.tierHeader ? this.tierHeader('base') : { pre: 'From', p: '$199', per: '/mo' }), cta: 'Claim your spot' },",
  },
  {
    why: "Pricing config: the compare table's tier prices (Scale)",
    find: "{ n: 'Scale', p: '$999', per: '/mo', cta: 'Book a demo', hi: true },",
    replace: "{ n: 'Scale', ...(this.tierHeader ? this.tierHeader('scale') : { p: '$999', per: '/mo' }), cta: 'Book a demo', hi: true },",
  },
  {
    why: "Pricing config: the compare table's tier prices (Enterprise: From $2,500/mo)",
    find: "{ n: 'Enterprise', p: 'Custom', per: '', cta: 'Book a demo' }",
    replace: "{ n: 'Enterprise', ...(this.tierHeader ? this.tierHeader('enterprise') : { p: 'Custom', per: '' }), cta: 'Book a demo' }",
  },
  {
    why: "Pricing config: the Base scene's price and seat note",
    find: "price: '$199', per: true, note: '+ $75 per seat · capped at $499/mo',",
    replace: "...(this.scenePrice ? this.scenePrice('base') : { price: '$199', per: true, note: '+ $75 per seat · capped at $499/mo' }),",
  },
  {
    why: "Pricing config: the Scale scene's price",
    find: "price: '$999', per: true, note: 'Up to 50 seats',",
    replace: "...(this.scenePrice ? this.scenePrice('scale') : { price: '$999', per: true, note: 'Up to 50 seats' }),",
  },
  {
    why: "Pricing config: the Enterprise scene's price (From $2,500/mo)",
    find: "price: 'Custom', per: false, note: 'Built around your operation',",
    replace: "...(this.scenePrice ? this.scenePrice('enterprise') : { price: 'Custom', per: false, note: 'Built around your operation' }),",
  },
  {
    why: "Pricing config: the compare table's Seats row",
    find: "['Seats', '1', '$75 each, capped at $499/mo', 'Up to 50', 'Unlimited']",
    replace: "['Seats', '1', this.seatsRow ? this.seatsRow() : '$75 each, capped at $499/mo', 'Up to 50', 'Unlimited']",
  },
];

export const templatePatches = [
  {
    why: "Pricing config: the stockbot strip names the founding price",
    find: /Not ready for a plan\? Start with stockbot, (<span [^>]*>)\$20\/mo<\/span>\./g,
    count: 1,
    replace: (_m, span) => `Not ready for a plan? Start with stockbot at the founding price, ${span}{{ prFoundingMo }}</span>.`,
  },
  {
    why: "Pricing config: the per-seat answer, from the config (monthly and yearly)",
    find: /(<div id="faq-a-2"[^>]*><div[^>]*><p[^>]*>)Base is [\s\S]*?costs nothing extra\.(<\/p>)/g,
    count: 1,
    replace: (_m, open, close) => `${open}{{ faqBaseSeats }}${close}`,
  },
  {
    why: "Pricing config: 'Can I cancel anytime?' gives the new terms per plan (stockbot anytime, Base after onboarding, Scale and Enterprise at the end of the contract)",
    find: /(<div id="faq-a-5"[^>]*><div[^>]*><p[^>]*>)Yes\. There are no setup fees and no lock-in\. Cancel anytime, and your data comes with you\.(<\/p>)/g,
    count: 1,
    replace: (_m, open, close) => `${open}{{ faqCancel }}${close}`,
  },
];
