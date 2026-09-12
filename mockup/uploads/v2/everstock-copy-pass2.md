# Everstock landing page, copy pass 2

Rewritten for tone, balance and stacking. Every line below is final copy with its breaks set.

---

## What changed from pass 1, and why

**The tone was blaming the reader.** "You paid last week's price. You just don't know it yet." is a
gotcha pointed at the person reading it. These are operators who are good at their jobs and have been
handed software that promised to fix this and didn't. The failure belongs to the tooling. Every line
below moves the fault to the system and keeps the reader competent.

**Too many sentences started with "It."** That reads like a spec sheet. The fix is not swapping in
"we", it is restructuring so *you* is the subject: "You set the price limits" instead of "It watches
prices against the limits you set."

**Too much weight on the buying.** The buying is the visible part, the learning is the actual claim.
Section 03 now carries more of the page and the hero leads with learning.

**No em dashes anywhere.** Commas, full stops, or a rewrite.

---

## The measure rule, which is what's breaking the stacking

Hard breaks are already written into the copy. They are not surviving because the columns are too
narrow, so the container re-wraps the line anyway and you get a jump that nobody asked for. Section 06
is the clearest case: "This makes your job easier, not obsolete." is set in a column around 380px at
44px type, which cannot hold a 27-character line, so it breaks into three.

**The rule: a display headline's column must fit its longest intended line with about 10% slack.**
Set `max-width` in `ch`, sized off the longest line, not off a layout grid.

```
headline longest line   set max-width
18 chars                22ch
27 chars                30ch
37 chars                41ch
```

Lines are `display: block` spans. No `text-wrap: balance` on display type, it optimises for even
ragging and will split a clause to do it. Below 640px viewport, drop the hard breaks and let it wrap
naturally, since no fixed break survives that narrow.

Intended lines stay within about 15% of each other in width. Most of the rewrites below are as much
about getting two lines to the same length as about the words.

---

## Hero

```
PROCUREMENT FOR PARTS DISTRIBUTORS

EVERSTOCK

Everstock learns your operation.
Then it buys the way you would.

Nothing gets ordered until you say so.
```

Statement column: `max-width: 36ch`. Lines are 32 and 31 characters, which is why they sit square
under the wordmark instead of wedging.

*Why:* leads with learning rather than buying, which is the balance that was off. "Buys the way you
would" is the payoff of having learned, not a separate claim. The trust line stands on its own instead
of riding along as the back half of a sentence about files.

---

## Trust bar

| Before | After |
|---|---|
| Deterministic rules, automated legwork | You set the rules. We do the legwork. |
| Every order waits for your approval | Every order waits for your yes |
| For parts, electronics & industrial distributors | For parts, electronics and industrial distributors |
| Works with your existing ERP | Runs on the ERP you already have |
| Human in the loop by default | Nothing buys itself |
| No rip and replace | Nothing gets ripped out |

---

## 01 · The Leak

```
The price changed.
Your system didn't.
```

Column: `max-width: 24ch`. Lines are 18 and 19 characters.

> A quote comes in by email. Another by phone. A third as a PDF someone photographs off a screen.
> Checking every new number against the last one is a full time job, and nobody has a spare one. So the
> old number keeps getting paid.

> You already know "close enough" doesn't exist here. Wrong revision, wrong finish, wrong thread pitch,
> and a line goes down. The problem was never that you didn't care. It's that nothing you've been given
> actually keeps track.

*Why:* the headline now blames the system, which is both truer and far more persuasive than blaming
the reader. "A full time job, and nobody has a spare one" is the empathy beat, it says the reader is
outnumbered rather than careless. "You already know" treats them as the expert they are. The last two
sentences name the real grievance: they have bought this promise before.

Everstock still appears nowhere in this section. It is the problem section.

---

## 02 · The System

```
You set the rules.
We handle the legwork.
```

Column: `max-width: 26ch`. Lines are 18 and 22.

> You set the price limits and the reorder points. Everstock watches every SKU against them, chases
> the quotes, checks the spec down to the revision and the finish, and drafts the purchase order. Then
> it stops and waits for you.

> It runs on top of what you already have. Your ERP, your EDI feeds, your spreadsheets. Nothing gets
> replaced.

### Step cards

| | After |
|---|---|
| **01 Watch** | Every SKU you carry, checked against the price and stock thresholds you set. |
| **02 Propose** | When a price moves or stock hits your reorder point, a drafted purchase order lands in your queue. Nothing gets bought without you. |
| **03 Execute** | You approve. The order goes out through your own vendor accounts, and every step is logged. |

*Why:* the body opens with "You set" rather than "It watches", which reverses who the sentence is
about. The cards now start with "Every SKU you carry", "a drafted purchase order lands in your queue"
and "You approve" instead of three sentences beginning with "It". "The rules engine" is gone, that was
internal vocabulary on a customer page.

---

## 03 · The Model

```
You already have the data.
It just isn't in one place.
```

Column: `max-width: 30ch`. Lines are 26 and 27.

> Point Everstock at an invoice, a pricing spreadsheet, a purchase order. It reads them and builds a
> working model of how your operation buys. Which vendors carry which parts, what you paid, how often,
> on what terms.

> That model is what everything else runs on. Nothing gets sourced, priced or ordered until it exists.

**Caption under the interactive:** Open a source to watch it fill in.

*Why:* this section carries the most weight on the page now and the headline earns it. "You already
have the data, it just isn't in one place" is the unified data layer claim in words a distributor
would use, and it flatters the reader rather than diagnosing them. The second paragraph is new, and it
is what stops the rest of the page reading as a features list. Sourcing and ordering are consequences
of the model, not parallel to it.

---

## 04 · The Guardrail

```
Nothing moves without your sign-off.
```

Unchanged. Best headline on the page.

> Proposed, then approved, then executed. Always in that order. Here's what happens in between.

---

## 05 · The Contract

```
Every proposal shows you the quote,
the spec, and the rule that fired it.
You approve with the whole picture
in front of you, or you don't.
```

Column: `max-width: 41ch`. Lines are 35, 37, 34, 30.

*Why:* "carries" became "shows you", which puts the reader in the sentence. "The reason it fired"
became "the rule that fired it", which is concrete and points back at section 02, where they set the
rule.

**Cut:** `AGENT ACTIVE · 14 QUOTES IN QUEUE`. A fabricated live number on a site with no customers,
and the person most likely to notice is the operator reading section 06. Replace with
`AGENT ACTIVE · APPROVAL REQUIRED`.

**Cut:** "Onboarding in 2 weeks". Replace with `Mid-market distributors · Design partners only`.

---

## 06 · Your Desk

```
Your judgment goes further.
Your job stays yours.
```

Column: `max-width: 30ch`. Lines are 27 and 21.

> You still see every quote it gathered, approve every order, and stay the one who knows the vendors.
> What goes away is the part where you chase all of it by hand.

*Why:* "This makes your job easier, not obsolete" raises the fear in order to deny it, which leaves
the word "obsolete" sitting in the reader's head. It was also the worst-stacked headline on the page,
27 characters and 13 in a column that fit neither. The new version makes the same promise without
naming the threat, and the two lines are close enough in width to sit square.

---

## 07 · Your Stack

```
Keep the systems you have.
Nothing gets ripped out.
```

Column: `max-width: 28ch`. Lines are 26 and 24.

> Everstock connects to the ERP, the supplier catalogs and the EDI feeds you already run, and keeps
> pricing and product data in sync across them. Still tracking prices in a spreadsheet? That works too.

**Closing line:** If you can export a price file, you can start.

*Why:* "It sits on top of what you already run" was 39 characters against a 24 character second line,
which is the wedge shape. "Keep the systems you have" is an imperative to the reader and balances.

---

## 08 · Outcome marquee

| Before | After |
|---|---|
| Fewer stockouts | Fewer stockouts |
| Faster vendor response | Vendors answer faster |
| Cleaner audit trail | An audit trail that already exists |
| Prices you can actually compare | Prices you can actually compare |
| Time back for your ops team | Your ops team gets its afternoon back |
| No more spreadsheet reconciliation | No more reconciling spreadsheets |

---

## 09 · Final CTA

```
You shouldn't have to guess
what you pay to restock.
```

Column: `max-width: 30ch`. Lines are 27 and 24.

> You set the thresholds and the specs. Everstock watches the prices, chases the quotes, and drafts
> the paperwork, then puts a proposal in your queue for a yes or a no.

> We're onboarding a small group of mid-market distributors as design partners.

*Why:* "Stop guessing at what you pay to restock" is an instruction that implies the reader is
currently guessing by choice. "You shouldn't have to guess" says the same thing and puts the fault
where it belongs.

---

## Housekeeping

**Em dashes.** None in the copy above. Two remain in the approval queue sample data and should go:
`Wix filters — bulk case` becomes `Wix filters, bulk case`, and `Brake pads — front set` becomes
`Brake pads, front set`.

**Words that stay off the page.** Seamless, leverage, unlock, streamline, robust, empower, supercharge,
solution, visibility, discipline, deterministic. The last one is accurate and belongs in the investor
deck, where the reader knows what it means.

**Constructions that stay off the page.** "Not just X, it's Y." "Whether you're A or B." Anything that
opens with a rhetorical question the copy then answers.

**No invented numbers.** When a design partner gives you one verified figure, dollars recovered or
hours per week, it goes directly under the hero and it will outperform every headline here. Until
then, specificity comes from nouns.
