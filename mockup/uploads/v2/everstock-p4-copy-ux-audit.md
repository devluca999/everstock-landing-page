# Everstock v2 — Prompt 4 of 4: Copy and UX audit

Send last. This replaces the earlier copy prompt.

---

> A copy and UX audit of the whole page. Do not start with sentences. Start with intent.
>
> ## Step 1 — State the intent before you change anything
>
> Write down, in one sentence, what this page is for. Then audit every section against it.
>
> The answer, so we are working from the same one: **this page exists to get a mid-market distributor
> to request access.** Not to explain the product completely. Not to impress investors. Not to
> establish a category. One reader, one action.
>
> That gives you the test for every section, every headline and every paragraph on the page: *does this
> move a distributor closer to requesting access, or is it here because it was interesting to write?*
> Anything that fails, cut or rewrite. A section that is true, well-written and irrelevant to that
> reader is still costing you the page.
>
> ## Step 2 — Order the argument the way a person actually decides
>
> Lead with why this matters to them, then how it works, then what it is. The current page frequently
> inverts this, opening a section with a mechanism and arriving at the stake three paragraphs later, or
> burying the strongest line at the bottom in the smallest grey text.
>
> For every section: find the most specific sentence in it. If that sentence is not the first thing the
> reader sees, restructure until it is.
>
> ## Step 3 — Fix the voice
>
> This is the single biggest problem across the page, and it has one signature: **headlines built from
> abstract noun phrases with no subject and no verb.**
>
> ```
> Before:  Deterministic rules, automated legwork
> After:   You set the rules, we automate the legwork
> ```
>
> Same content. The second one has a person in it doing something. The first is a tagline about a
> product; the second is a sentence about the reader's life.
>
> Rules, applied everywhere:
>
> 1. **The reader is the subject.** "You" wherever it is honest to use it. If a sentence has no human
>    in it, ask who is doing the thing and put them back.
> 2. **Verbs, not nominalizations.** "You approve" not "the approval workflow." "It checks the price"
>    not "price verification."
> 3. **No two-abstract-nouns-joined-by-a-comma headlines.** That construction reads as a slogan, and
>    slogans get skipped. If a headline has no verb, rewrite it until it does.
> 4. **Active voice.** "Everstock drafts the order" not "the order is drafted."
> 5. **Name the specific failure, not the general condition.** "No clear view of what you're paying" is
>    a condition. "You paid last week's price" is a failure. One gets nodded at, the other gets
>    recognised.
> 6. **Cut the category words.** Visibility, discipline, solution, workflow, seamless, leverage,
>    streamline. If the sentence survives their removal, they were decoration.
> 7. **Concrete nouns.** Email, phone, PDF, revision number, thread pitch. The words a distributor
>    uses. "Spec precision" is not one of them.
> 8. **One idea per sentence.** A sentence with three clauses is three sentences.
>
> ## Step 4 — Worked example, section 01
>
> Currently:
>
> > **You spend thousands a month restocking parts, with no clear view of what you're paying or whether
> > the price still holds.**
> > In distribution, "close enough" doesn't exist. SKU, size, model, revision, finish: Everstock matches
> > the exact spec you defined, or it stops and asks. Same discipline whether you move auto parts,
> > electronics, or industrial supply.
> > Vendor quotes still land by email, phone, and PDF. No one on your team has time to check whether
> > last week's price is the one you just paid.
>
> Rewrite as:
>
> > **You paid last week's price.**
> > **You just don't know it yet.**
> >
> > Quotes arrive by email, by phone, as a PDF someone photographs off a screen. Nobody has time to
> > check the new number against the old one. So the old one keeps getting paid.
> >
> > And close enough doesn't exist here. Wrong revision, wrong finish, wrong thread pitch — that is a
> > line down, not a discount. Everstock matches the spec you defined or it stops and asks.
>
> What changed: the buried third paragraph became the headline; the abstraction became a specific
> event; "same discipline whether you move auto parts, electronics, or industrial supply" was cut for
> hedging the vertical instead of committing to one; and "a line down, not a discount" replaces "close
> enough doesn't exist" because it names the actual stake.
>
> ## Step 5 — Re-break the lines after rewriting
>
> New copy needs new breaks. Do not inherit the old ones.
>
> Headlines break at clause boundaries — a comma, a conjunction, the end of a sentence — never
> mid-clause. A comma ends a line and never starts one. Never leave a single word alone on the last
> line. Keep line widths within about fifteen percent of each other. Prepositional phrases stay intact.
> Use hard breaks in the markup rather than `text-wrap: balance`, which optimises for even ragging and
> will split a clause to even out two lines. Define the breaks per breakpoint, since a three-line stack
> at desktop is usually four at tablet.
>
> Body copy wraps naturally. This applies to display type only.
>
> ## Constraints
>
> Do not invent numbers. No percentages, no dollar figures, no time-saved claims — there are no
> verified statistics yet. Specificity comes from concrete nouns and real situations, never from
> fabricated data.
>
> Keep the hero copy as it stands.
>
> ## Deliverable
>
> Before/after for every headline and section intro you changed, with a one-line reason for each. If a
> section survived unchanged, say which and why it already passes the intent test.
