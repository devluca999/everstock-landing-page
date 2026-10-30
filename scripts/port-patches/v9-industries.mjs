// v9 site patches for the Industries box ("Built for anything that ships in a box"), 2026-10-30.
// Same rules as the patches in scripts/port-dc.mjs: each anchor must match its count exactly.
const STAMP_ROW_OPEN =
  '<div style="display:flex;justify-content:flex-end;align-items:center;min-height:40px;border-top:1px dashed rgba(26,27,31,0.3);padding-top:8px;">';
export const templatePatches = [
  {
    why: "Industries box (Luca, 2026-10-30): at desktop sizes the label's Part / Fits / From rows did not fit the paper, so 'From' ran under the MATCHED stamp's row; the stamp now sits outside the text flow (on the paper, just over the end of the From line), and the rows get the whole label",
    find: "display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:10px;color:#1A1B1F;",
    replace: "display:grid;grid-template-rows:auto auto;align-content:start;gap:10px;color:#1A1B1F;",
  },
  {
    why: "Industries box: the stamp's wrapper is pinned to the label's bottom right corner, fully on the paper (on the brown edge it was hard to read), overlapping the From line a little",
    find: STAMP_ROW_OPEN,
    replace:
      '<div style="position:absolute;right:clamp(10px,2vw,18px);bottom:clamp(3px,0.5vw,6px);z-index:1;pointer-events:none;display:flex;">',
  },
];
export const logicPatches = [
  {
    why: "Industries box: the stamp no longer nudges itself down into the From row (its wrapper places it now)",
    find: "stampTf: this.state.stampOn ? 'translate(6px,16px) rotate(-6deg) scale(1)' : 'translate(6px,16px) rotate(-6deg) scale(1.3)',",
    replace: "stampTf: this.state.stampOn ? 'rotate(-6deg) scale(1)' : 'rotate(-6deg) scale(1.3)',",
  },
];
