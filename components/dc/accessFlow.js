/**
 * The waitlist / Book a demo modal's site-side flow, shared by the home page and /pricing.
 * The fields and the follow-up questions are template patches (ACCESS_FIELDS and
 * ACCESS_STEPS in scripts/port-dc.mjs); this is the logic behind them.
 *
 * - The form asks for a name, an email, an optional work email, an optional company and
 *   an optional "How did you hear about us?". At least one of the two emails is needed.
 * - Once it is sent, Book a demo asks "the waitlist too?" and both ask about the founding
 *   partner program, one question at a time. Each answer is recorded on the row the form
 *   created (/api/request-access/answer), after that row exists.
 */
import { sendRequest, sendAnswer } from "./host";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const QUESTIONS = {
  waitlist: {
    title: "Want a spot on the waitlist too?",
    body: "We'll add you to the list for early access.",
    yes: "Add me",
    no: "No thanks",
  },
  founding: {
    title: "Interested in the founding partner program?",
    body: "Founding partners work with the founders from day one and shape what Everstock does first.",
    yes: "Yes, I'm interested",
    no: "Not right now",
  },
};

const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "";

/* Reads and validates the form; reports the first problem on the field and returns null. */
function readForm(form) {
  const field = (n) => form.elements.namedItem(n);
  const val = (n) => String((field(n) && field(n).value) || "").trim();
  // the message clears on any edit to the form, not just its own field: "add an email" is
  // answered by the work email field too, and a message left standing blocks the submit
  const flag = (input, msg) => {
    if (!input || !input.setCustomValidity) return;
    input.setCustomValidity(msg);
    input.reportValidity();
    form.addEventListener("input", () => input.setCustomValidity(""), { once: true });
  };
  const data = {
    name: val("name"),
    email: val("email"),
    workEmail: val("workEmail"),
    company: val("company"),
    heardFrom: val("heardFrom"),
    website: val("website"), // honeypot, checked by the route
  };
  if (data.name.length < 2) return flag(field("name"), "Add your name."), null;
  if (!data.email && !data.workEmail) return flag(field("email"), "Add an email, personal or work."), null;
  if (data.email && !EMAIL.test(data.email)) return flag(field("email"), "Enter an email like you@example.com."), null;
  if (data.workEmail && !EMAIL.test(data.workEmail)) return flag(field("workEmail"), "Enter an email like you@company.com."), null;
  return data;
}

/**
 * Handles the modal's submit. `plan` is "demo" or "waitlist"; `designSubmit` is the
 * design's own handler (it flips the modal to its sent state). Returns false when the
 * form did not validate (nothing was sent).
 */
export function submitAccess(logic, e, { plan, note, elapsed, tag, designSubmit }) {
  e.preventDefault();
  const data = readForm(e.currentTarget);
  if (!data) return false;
  const waitlist = plan === "waitlist";
  logic.accPending = sendRequest(
    {
      ...data,
      stack: "other",
      source: waitlist ? "waitlist" : "book-demo",
      waitlist: waitlist || undefined,
      note,
      elapsed,
    },
    tag
  );
  logic.accEmail = (data.email || data.workEmail).toLowerCase();
  logic.accTag = tag;
  logic.setState({
    accFirst: firstName(data.name),
    accQueue: waitlist ? ["founding"] : ["waitlist", "founding"],
    accFounding: undefined,
  });
  designSubmit(e);
  return true;
}

function answer(logic, yes) {
  const [q, ...rest] = logic.state.accQueue || [];
  if (!q) return;
  const fields = q === "waitlist" ? { waitlist: yes } : { foundingInterest: yes };
  const email = logic.accEmail;
  const tag = logic.accTag;
  // the row has to exist before it can be patched; a form that failed to send has no row
  Promise.resolve(logic.accPending).then((stored) => {
    if (stored) sendAnswer({ email, ...fields }, tag);
  });
  logic.setState({ accQueue: rest, ...(q === "founding" ? { accFounding: yes } : null) });
}

/** Render values for ACCESS_STEPS, plus the eyebrow for the waitlist mode. */
export function accessVals(logic, plan) {
  const s = logic.state;
  const queue = s.accQueue || [];
  const q = QUESTIONS[queue[0]];
  const who = s.accFirst ? `, ${s.accFirst}` : "";
  const finished = !q;
  let sentText;
  if (plan === "demo") sentText = finished ? `All set${who}. We'll be in touch to set up your demo.` : `Thanks${who}. We'll be in touch to set up your demo.`;
  else sentText = finished ? `All set${who}. You're on the waitlist and we'll be in touch.` : `You're on the waitlist${who}. We'll be in touch.`;
  if (finished && s.accFounding) sentText += " We'll tell you more about the founding partner program too.";
  return {
    accEyebrow: plan === "demo" ? "30 minutes with the founders" : "Early access",
    accPlanName: plan === "demo" ? "a demo" : "the waitlist",
    accSentText: sentText,
    accAsk: !!q,
    accAskTitle: q ? q.title : "",
    accAskBody: q ? q.body : "",
    accYesLabel: q ? q.yes : "",
    accNoLabel: q ? q.no : "",
    accYes: () => answer(logic, true),
    accNo: () => answer(logic, false),
    accFinished: finished,
  };
}
