# BRIEF: Learn to grow (`/learn`, `/learn/:cropId`)

**Self-authored under explicit creative delegation.** The user answered the peak and the feeling curve
(quoted below) and wrote: "Other defaults are yours to choose, and follow its rules." Everything not in
quotes is an authored decision, labelled as such.

Built inside the NTU Food Living Lab React app, not as a standalone page. The scroll-craft engine was
not used: its stylesheet sets global rules (`html`, `body`, `img`, `:focus-visible`, `::selection`) that
would stay applied to every other route once the Learn chunk loads, and `data-sc-kinetic` rewrites DOM
that React owns. Per the user ("If its engine doesn't work cleanly inside React, follow its rules using
motion instead"), the devices are rebuilt with `motion` scroll values and one CSS custom property
(`--grow`, the page's equivalent of `--sc-p`), animating transform and opacity only.

## The eight topics

1. **Vibe** (authored): a botanist's field notebook kept by students. Calm, exact, a little warm.
   References: a herbarium sheet with pencilled labels; a seed packet's back panel; a garden journal.
2. **Journey** (user, Part 3 spec): "a scroll-driven journey (sow → seedling → growing → ready →
   harvest), with pinned sections, an illustration that grows as you scroll, and short practical steps
   per stage", then the "At NTU" panel, "What went wrong here", Singapore climate notes, "Grow this
   with us", and NParks resources.
3. **Energy curve** (authored): quiet open, steady and absorbing through the stages, the loudest change
   at harvest, then calm and practical to the end.
4. **Feeling, and the one moment** (user): "a seed becomes a harvest as they scroll, and the 'At NTU'
   numbers appear when it's ready." Feeling curve (user): "curious → absorbed → rewarded → motivated
   to join."
5. **What no other site does** (authored, from the user's peak): the plant is drawn from parts and grows
   under the reader's own scroll against a ruler of the crop's real days to first harvest; when it is
   ready, the real numbers from NTU's beds hang off the grown plant as specimen tags.
6. **Aesthetic range** (authored): editorial. The app's own paper and forest tokens, Newsreader display
   and Public Sans text. No new palette, because Learn is part of one product.
7. **One world or scenes** (authored): one held plate for the whole journey (split stage), not a
   continuous camera world.
8. **Assets** (user): no AI images. "Draw the growth stages as SVG in code: a consistent botanical line
   style, one stroke weight, a limited palette that matches our theme, and a light background."
   Crop close-ups only from freely licensed photos (Wikimedia Commons CC0 / CC BY / CC BY-SA, Unsplash,
   Pexels), credited.

**World:** botanical plate, the illustrated cousin of worlds.md's technical drawing: fine single-weight
line (1.75), round caps, ink and forest greens on paper, one accent (terracotta) for fruit and the
harvest. Earned: the user asked for drawn botanical stages, and the app already draws its plants this way.

## Grammar: split stage

The page is an argument with two sides held together: **the plant** (what it looks like) and **what you
do** (the steps). Both are present the whole way down; scroll resolves them at harvest.

- Hero: the split at 50/50 on the first screen. Left: the crop's title plate with the sown seed and a
  faint outline of the grown plant behind it. Right: what this guide is and how long it takes.
- Chrome: the **divider**. It carries both labels ("The plant" / "What you do"), the stage names and a
  ruler of the crop's real days to first harvest with a marker at the current day.
- Close of the split: the **collapse**. The step column leaves, the divider travels to the edge, the
  plant takes the whole stage, and the At NTU tags arrive. After the collapse the page is one column
  (the winning one) and the call to action lives in it.
- Phone: the split turns 90°. Plant above, words below, the divider is horizontal under the plant.
- Bans honoured: no pan, no spotlight, no magnet, no scrub, no drift, no centred hero copy.

Why the other seven lost: **filmic one-shot** hides its seams, but this guide wants the reader to see two
sides at once; **chaptered editorial** forbids the media column holding across chapters, which the peak
needs; **live surface** is for tools (the workspace already is one); **continuous world** needs real
geography; **typographic poster** throws away the drawing, which is the point; **gallery** is the `/learn`
index, not a single crop; **rhythmic cutlist** is the opposite of calm.

`/learn` (the index) is a **gallery / catalog**: specimen plates of every crop with one label schema
(name, scientific name, days to first harvest, NTU survival, beginner rating). No hero claim.

## Feeling curve (written before the acts)

| Act | Feeling | Cause on screen |
|---|---|---|
| 1 Title split | Curious | A single seed in a line of soil, the grown plant only a ghost behind the title |
| 2 Sow to growing | Absorbed | The stem rises and leaves unfold as the steps change beside it; the day marker walks the ruler |
| 3 Ready | Anticipation (quiet) | Fewer words. The plant is full, a real photo shows what "ready" looks like |
| 4 Harvest, the collapse | **Rewarded (peak)** | The steps leave, the plant takes the stage, cut stems fall into the basket and the NTU numbers hang off it as tags |
| 5 What went wrong here | Forewarned, trusting | Real problems from NTU's logs, each with what fixed it, set plainly |
| 6 Grow this with us | Motivated to join | Beginner tasks at the sites that grow it, the site to join, NParks for more |

**The peak:** "I scrolled and the seed grew into a whole basil plant, and when it was ready the real
numbers from the campus gardens popped out on little tags." Lives in act 4.

**Tell-someone sentence:** It's the site where you grow a plant from seed by scrolling, and the campus's
own numbers hang off it when it's ready.

**Authored silence:** act 3 (Ready) is deliberately sparse, one short paragraph and a photo, so the
collapse has something to arrive from. It is not dead scroll.

## Score

| Act | Device | Why this one |
|---|---|---|
| 1 Title split | `parallax` (three planes: ghost plant, seed, soil line in front of the title's baseline) | Depth for the hero without media above the type |
| 2 Sow to growing | `pin` (split stage) with cues crossing over in the words column | The plant holds while the instructions advance: an argument, not a film |
| 3 Ready | `reveal` (a wipe on the real crop photo) | A change of state: from drawing to the real thing |
| 4 Harvest | `pin`, longest span on the page, + the signature move | The peak gets the room and the bespoke behaviour |
| 5 What went wrong | `flow` + `in` | Information, compressed, no pinning |
| 6 Grow this with us | `flow` + `in`, close holds | Resolves on one action, not a fade |

Four device families (parallax, pin, reveal, flow). No family twice in a row (pin, reveal, pin, flow).
Peak span 1.8 viewport-heights against 0.9 for each stage. Whole crop page about 9 to 10
viewport-heights.

**Numbers:** the At NTU figures are computed from the platform's logs, which in this prototype are
demonstration data. They are labelled as demo data on the page and they **appear** (cue), they do not
**count up**: a counter is a truth claim with motion attached.

**Reduced motion:** no pin, no growth. The five stages are drawn as five static plates, each beside its
steps, and the tags sit on the final plate. Same meaning, no movement.

**Signature move:** specimen tags. When the plant reaches harvest, each NTU figure arrives as a paper tag
on a thread tied to the part of the plant it describes (survival on the stem, days to harvest on the cut
leaves, best site on the pot, beginner rating on the seedling leaves).

## Verification (Step 5)

Shot with a Playwright script in the scratchpad (the skill's `shoot.mjs` expects engine markup, which this
build doesn't use): 16 evenly spaced frames of the pinned journey at 1440 × 900 and 390 × 844, a reduced-
motion full page, and the crop library. Checked: no horizontal overflow at either width, no console
errors, every stage's text fully opaque at its plateau, the photo wipe completes inside Ready, and the
tags land after the collapse and hold to the end of the act.

Fixed after the first pass: the plant had no height on desktop (its box collapsed inside the tag
wrapper); the phone stage sat under the bottom tab bar; the phone ruler's tick numbers collided with the
stage names; the Ready photo overflowed on phones; pandan's leaves pointed the wrong way; turmeric's
library plate showed dried leaves.

**Feel check (scrolled cold, one word per act):** Title: curious (the ghost of the grown plant behind
one seed). Sow to growing: absorbed. Ready: quiet, then "oh, that's what it looks like" at the photo.
Harvest: busy for a moment (cut marks, basket and steps at once), then rewarded when the split
collapses and the tags arrive. What went wrong: forewarned. Grow this with us: ready to go.
Diff against the brief: the beat right before the peak is louder than intended (the cut and the
harvest steps arrive together). Kept, because the cut is part of the payoff, but the collapse and tags
still take the largest scroll room (about 1.2 of the act's 2 viewport-heights).

**Not covered:** a real phone (headless Chrome can't reproduce iOS scrolling), and screen-reader
announcement of the day readout (it is `aria-live="off"` on purpose; the stage list carries
`aria-current`).
