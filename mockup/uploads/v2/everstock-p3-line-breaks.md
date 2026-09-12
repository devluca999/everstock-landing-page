# Everstock v2 — Prompt 3 of 4: Line breaks

Send third. One concern only — this was asked for once and dropped, so it is on its own.

---

This was asked for once and not done, so it is restated alone.

> One task: fix where display headlines break. Nothing else in this pass.
>
> Headlines are wrapping wherever the container happens to end, which splits phrases the eye needs to
> hold together. This is page-wide.
>
> ## Do these two first, exactly as written
>
> Section 06 currently reads `This makes your / job easier, not / obsolete.` Change to:
>
> ```
> This makes your job easier,
> not obsolete.
> ```
>
> Section 05 currently reads `Every proposal carries the quote, the / spec, and the reason it fired.
> You / approve with the full picture in front / of you, or you don't.` Change to:
>
> ```
> Every proposal carries the quote,
> the spec, and the reason it fired.
> You approve with the full picture
> in front of you, or you don't.
> ```
>
> ## Then apply the same rules everywhere else
>
> 1. A line breaks at a clause boundary — a comma, a conjunction, or the end of a sentence. Never
>    mid-clause.
> 2. A comma ends a line. It never starts one.
> 3. Never leave one word alone on the final line. `obsolete.` sitting by itself is the clearest tell
>    that the container broke the line rather than the writer.
> 4. Keep line widths within roughly fifteen percent of each other.
> 5. Prepositional phrases stay intact. `in front of you` never splits.
> 6. Use hard breaks in the markup. Do **not** use `text-wrap: balance` for display type — it optimises
>    for even ragging rather than for meaning, and will split a clause to even out two lines. If
>    `balance` is applied to any headline, remove it. It is very likely producing the current breaks.
> 7. Define the breaks per breakpoint. A three-line stack at desktop is usually four at tablet, and the
>    clause boundaries move with it. Desktop breaks carried down unchanged read worse than automatic
>    wrapping.
>
> ## Scope
>
> Every headline, sub-headline, section intro, pull quote and CTA line, both pages, hero included.
>
> Not body copy. At body scale the reader is not holding whole phrases in one glance, and forcing
> clause breaks there produces a strange rag for no gain.
>
> Where a headline cannot break cleanly because the column is too narrow, widen the column. The clause
> structure decides the breaks; the container accommodates them.
>
> ## Before you finish
>
> List every display headline with its line breaks as built. Any line ending in a preposition, an
> article, or a conjunction is wrong and needs another pass.
