# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| learn-to-grow (NTU Food Living Lab, `/learn/:cropId`) | Split stage | The divider: a ruler of the crop's real days, day readout, five stage names | Split 50/50 inside the pin: ghost of the grown plant behind one seed (parallax), title on the right | parallax hero → pin (5 stages, cues) → reveal (photo wipe) → pin peak (collapse) → flow → flow; one pinned act of 6.1vh plus two flow sections; ~10vh total | Collapse to the plant column, then a single-column close with one action as a full-width line and button | Specimen tags: NTU's figures hang off the grown plant on threads tied to the part they describe | Botanical plate: single-weight forest line on paper, terracotta for fruit | Inside the app (Vite dev server) |
| home-story (NTU Omniplant, `/` under the hero) | Collation (new): one pinned desk, objects are the actors, scatter → collate → unfold | None of its own (app header stays); the forest-green thread through the record is the only chrome | Static, unpinned photo hero with headline, two doors and a real-data "Happening now" row; no scroll effect | static hero → one pin (3 scenes at 0.25 / 0.45 / 0.30 of 0.9vh travel) → flow close; ~1.9vh story + close, 3 scenes | Bookend: the hero's two buttons repeated in flow after the pin releases | Notebooks to ledger: tilted, credited site photo cards with handwritten-style notes collate into one stacked record; each card shrinks into its row's thumbnail while its note slides into the row and is rewritten as the site's latest real harvest | Corkboard to ledger: real site photos as prints, terracotta-tint paper slips, paper and forest | Inside the app (Vite dev server) |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Split stage with a day-ruler divider.
- Specimen tags on a drawn plant as the peak.
- Botanical-plate world in the app's paper and forest palette.
- Collation grammar (scatter → collate → unfold on one pinned desk).
- Notebooks-to-ledger: scattered photo cards and notes collating into one record with rows from the real logs.
- A bookend close that repeats the hero's two doors.
- Short-story band: 3 scenes in under 2 viewport-heights.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
