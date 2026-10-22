# BRIEF: Home story (`/`, under the Explore hero)

**Self-authored under explicit creative delegation.** The user specified the hero, the three scenes,
the length cap, the close and the constraints (quoted below). Everything else is an authored decision,
labelled as such. Built inside the NTU Omniplant React app with `motion`, not the scroll-craft engine,
for the same reasons as `learn-to-grow` (global engine CSS, DOM rewriting).

**The question the page answers** (user): "How might NTU connect its existing but fragmented urban
food-growing efforts into something that generates lasting educational, research and economic value?"
**Job of the public side** (user): help gardens recruit members. Visitors see the gardens' progress and
join a community.

## The eight topics

1. **Vibe** (authored): a club noticeboard that has been tidied into a ledger. Warm, plain, a little
   relieved. References: a corkboard of pinned polaroids; a bound site logbook; a co-op's annual report.
2. **Journey** (user): static hero with "New here? Help out" and "Join a community", a "Happening now"
   row from real data; then "Four gardens, four notebooks" → "One shared record" → "Lasting value",
   ending with the two buttons again.
3. **Energy curve** (authored): calm hero, a small unease in scene 1, the loudest change in scene 2,
   then open and inviting.
4. **Feeling and the one moment** (authored): oriented → uneasy → relieved (peak) → hopeful → invited.
5. **What no other site does** (authored): the four gardens' own photos, pinned askew with scribbled
   notes, fall into line as one record, and each scribble is rewritten as the same kind of log row.
6. **Aesthetic range** (user): "Keep the editorial style: paper background, forest green, terracotta
   accent, fewer boxes."
7. **One world or scenes** (user): three scenes, "at most about 2 viewport heights in total".
8. **Assets** (user): "the four real site photos from public/images/sites/", credited, with blur-up.
   Nothing generated.

## Grammar: collation (new)

One pinned desk; the objects are the actors, nothing else moves. Sequence: scatter → collate → unfold.
**Nav:** none of its own (the app header stays); the forest-green thread through the record is the only
chrome. **Hero:** outside the grammar on purpose, static and unpinned (user). **Close:** a bookend, the
hero's two buttons repeated, in flow after the pin releases. **Bans:** scrub, pan, kinetic type,
full-bleed photo, parallax, text over photos, counters inside the story.

Why the others lost: *split stage* is taken by `/learn`; *filmic one-shot* and *continuous world* need
far more than 2 viewport-heights; *chaptered editorial* and *rhythmic cutlist* would cut the one
continuous gesture (the cards moving) into pieces; *typographic poster* throws away the photos;
*gallery* has no argument; *live surface* is the workspace's job.

## Feeling curve (written before the scenes)

| Part | Feeling | Cause on screen |
|---|---|---|
| Hero | Oriented | Headline, two clear doors, real numbers "happening now" |
| 1 Four gardens, four notebooks | Uneasy recognition | Four tilted photo cards, each with a scribbled note that drifts off as you scroll |
| 2 One shared record | **Relieved (peak)** | The cards straighten and slot into one record; a green thread ties them; each scribble becomes a tidy log row from the real logs |
| 3 Lasting value | Hopeful | The record opens into Educational, Research, Lasting, each a door |
| Close | Invited | The two buttons again |

**Peak:** "All the garden photos with messy notes snapped into one neat shared log." Scene 2.
**Tell-someone sentence:** It's the site where four messy garden notebooks fall into one record as you
scroll, and then show you where you fit in.
**Authored silence:** none; the story is too short to hold one.

## Score

| Part | Device | Why |
|---|---|---|
| Hero | static (no scroll effect) | User: "fast and static". |
| 1 | `pin` + drift of the notes | The desk holds still so the loss is the only motion. |
| 2 | `pin` + the signature move (collate) | The peak gets the largest span: 45% of the travel. |
| 3 | `pin` + `reveal` (outcomes slide out from behind the record) | A change of state: record → value. |
| Close | `flow` | Resolves on the two actions, in normal flow. |

Length: section 190svh (90svh of travel), close in flow. Scene spans: 0.25 / 0.45 / 0.30 of the travel.
Only `transform` and `opacity` animate; positions are in container-query units so the same motion fits
360 px and 1440 px.

**Reduced motion:** nothing pins or moves (the `CropJourneyStill` pattern): three still steps, the
scattered cards with notes, the record with its rows, then the three outcomes and the buttons.

**Signature move:** notebooks to ledger. Tilted site photo cards with handwritten-style notes collate
into one stacked record card; each card shrinks into its row's thumbnail while its note slides into the
row and is rewritten as a consistent log entry (the site's latest harvest from the real logs).

**Numbers:** the hero counts up only real figures from the logs and the community store, and hides any
that would be zero. The story shows no counters.

## Verification

Playwright with headless Chrome (script in the session scratchpad; the skill's `shoot.mjs` expects engine
markup). Widths 360×740, 360×640, 390×844 and 1440×900, with and without reduced motion. At all of them:
both primary buttons sit on the first screen above the phone tab bar (390×844: 405–513 px of a 779 px
visible area), no horizontal scroll (also checked after scrolling through the pin), the role pill with
"Switch" fits, no console errors. Hero layout shift: 0 (the only entries are at ~235 ms during the app's
first mount and a webfont swap in the header nav). Links clicked through: Help out → `/get-involved?beginner=1`
with the filter on; See the committee view → Hall 12 Handover as the demo committee; Research → Dashboards;
focusing an outcome link by keyboard scrolls the story to where it is visible. "kg harvested this term"
cross-checked against the raw demo harvests (99.87 kg → "100 kg").

Fixed after the first pass: credit chips covered the small photo cards (now a one-line credit under each
photo, `PhotoCaption variant="line"`); the bottom notes hid the site names; three outcome columns wrapped
their links at 1440 (now three rows, like the record they open from); the record was small at 1440 (drawn
1.2× from 1280 px, with the cards aiming at the scaled rows); motion handed the scene cues' keyframes to
WAAPI, which rejects offsets outside 0–1 (now function transforms).

**Feel check (scrolled cold):** hero: oriented. Scene 1: a little messy, the notes leaving reads as loss.
Scene 2: relief; the cards dropping into rows is the clearest change on the page. Scene 3: open, practical.
Close: invited. Matches the curve. The mid-collate frame is busy for a moment on 360×640 (notes and cards
cross the record together); kept, because it resolves within a short scroll.

**Not covered:** a real phone (headless Chrome can't reproduce iOS touch scrolling), and how the
handwritten-style face renders on Android, which has none of the listed system hand fonts and falls back to
Newsreader.
