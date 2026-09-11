# Visual Language — Studio Standards

**ZhongX Studio — Visual Design Reference**

---

## VISUAL PHILOSOPHY

Every visual decision must serve the narrative. Visual style is not decoration — it is a tool for comprehension, emotional amplification, and retention.

A visual that is beautiful but disconnected from the narrative is a failed visual.
A visual that is simple but precisely serves the narrative is a successful visual.

---

## CORE VISUAL PRINCIPLES

### 1. Clarity Before Aesthetics
The viewer's eye must always know where to look. Composition, contrast, and motion should guide attention to what matters — not compete with it. When in doubt, remove, not add.

### 2. Visual Rhythm Matches Narration Rhythm
The visual editing beat should breathe with the narration. Fast narration = higher visual density. A narration pause = visual stillness, slow reveal, or breathing space. The synergy between audio and visual is what creates immersion. When they diverge, the viewer feels it — even if they cannot name it.

### 3. Every Cut Has a Purpose
A cut changes what the viewer sees. It should happen because the new image serves the narrative better than the current one at that specific moment — not because time has passed. Unmotivated cuts create visual noise.

### 4. Text on Screen Amplifies, Not Repeats
Text on screen should emphasize key words, visualize data, or add a dimension of meaning the narration cannot carry alone. Text that simply transcribes the narration adds nothing and creates cognitive load. If the narrator says "17 billion years," text showing "17,000,000,000 years" adds meaning. Text showing the full sentence the narrator is speaking adds nothing.

### 5. Consistency Is Trust
A consistent visual language tells the viewer they are in the hands of a professional. An inconsistent visual language — varying color logic, changing character styles, arbitrary motion — breaks trust and pulls attention away from content.

---

## COMPOSITION STANDARDS

**Framing types used in ZhongX Studio:**

| Framing | When to use |
|---------|------------|
| Close-up / Detail | Emphasis on a specific element; emotional weight; key data point |
| Medium / Concept | Explaining processes, relationships, comparisons |
| Wide / Establishing | Scale, context, dramatic reveals, transitions between segments |
| Abstract / Typographic | Concept visualization when literal imagery would oversimplify or mislead |
| Diagram / Infographic | Data visualization, step-by-step processes, relationship maps |
| Split / Comparison | Side-by-side contrasts or before/after structures |

**Compositional rules:**
- Rule of thirds applies to all non-abstract frames
- Primary subject occupies primary visual weight — do not compete with background elements
- Negative space is used deliberately — especially during high-emphasis narration moments where the viewer needs cognitive space
- Visual hierarchy in complex frames: one element leads, others support

---

## MOTION PRINCIPLES

**Motion serves one of four purposes:**

1. **Reveal** — bringing an element into frame to announce its importance
2. **Emphasis** — movement that underlines a narration cue (zoom on reveal, pulse on key word)
3. **Transition** — connecting scenes with visual logic (not arbitrary animation)
4. **Energy** — kinetic movement that maintains pace during high-density information sequences

**Motion failures to avoid:**
- Constant motion that creates viewer fatigue
- Motion that contradicts narrative tone (playful bounce animation during serious content)
- Transitions that interrupt rather than connect — the cut should feel like a breath, not a stumble
- Text animations that take longer to complete than the narration moment they accompany
- Camera movement with no clear purpose — unmotivated movement reads as amateur production

**Motion intensity by section:**

| Section | Motion intensity | Rationale |
|---------|-----------------|-----------|
| Hook | High | Creates urgency and energy |
| Explanatory scenes | Medium | Aids comprehension without distraction |
| Revelation / Surprise | Low → sudden High | Deceleration before impact amplifies the reveal |
| Payoff | Low, deliberate | Allows emotional resonance to land |
| CTA | Medium | Clear, visible, not rushed |

---

## ANIMATION STYLES

Each project uses one primary style, established by the Illustrator in `storyboard.md` and confirmed by the Director. Style consistency is non-negotiable within a single production.

**Style categories:**

| Style | Description | Best for |
|-------|-------------|---------|
| Flat Motion Design | Clean vector shapes, minimal texture, purposeful color palette | Data-driven, process-oriented, scientific content |
| Kinetic Typography | Text as primary visual element, high-energy text animation | Content where words carry the primary message |
| Illustrated Narrative | Character-driven or scene-driven illustration | Historical, biographical, human story content |
| Mixed Media | Combination of photography, illustration, and motion | Grounding abstract concepts in recognizable reality |
| Minimalist Documentary | Restrained motion, high contrast, near-photographic imagery | Research-heavy, serious, investigative content |

**Style selection requirements:**
1. Must be consistent with the tone defined in `brief.md`
2. Must be referenced against `/references/styles/` if an approved style exists for this project type
3. Must be proposed to CEO if a new style category is being established
4. Must be documented in `storyboard.md` at the top level before scene descriptions begin

---

## COLOR AND TYPOGRAPHY

**Color system:**

Each project establishes a 3-color palette:
- **Primary:** Dominant background or most-present color
- **Secondary:** Main content color, highest text contrast
- **Accent:** Used for emphasis, key terms, and data highlights — used sparingly

**Color rules:**
- Palette shifts between major sections may signal a new segment — use intentionally
- No palette changes within a single scene without narrative justification
- Minimum contrast ratio for all text: 4.5:1 against background (WCAG AA)
- Avoid using more than 3 colors in a single frame except for data visualizations

**Typography system:**

Each project uses a maximum of 2 typefaces:
- **Display typeface:** For key terms, section titles, data highlights — expressive weight
- **Body typeface:** For supporting text, annotations — high legibility at small sizes

**Typography rules:**
- ALL CAPS used only for maximum emphasis — no more than once per scene
- Text size must be legible at mobile viewing size (minimum 36px equivalent at 1080p)
- Visual hierarchy: size, weight, and color create reading order — the viewer's eye follows the most visually dominant element first

---

## ON-SCREEN TEXT STANDARDS

| Text type | When to use | Visual treatment |
|-----------|-------------|-----------------|
| Key term | New concept introduced in narration | Bold, accent color, appears on narration cue, stays 2–3 seconds |
| Data / Statistic | Number or data point mentioned in narration | Large, high contrast, brief display |
| Question / Open loop | Visualizing the curiosity gap | Distinct style — italic, or question mark visual, space to breathe |
| Section marker | Major topic transition | Full-frame or large, paired with visual transition |
| Quote / Source | Attributing a claim | Smaller, secondary weight, source name prominent |
| CTA | End of video | Single, clear action, high contrast, visual affordance |

**Text timing principle:** Text appears when the narration cue lands, not before. Text exits when the narration has moved past the concept it is supporting. Text on screen while the narration is discussing something else creates confusion.

---

## ASSET PROMPT STANDARDS

When writing prompts for AI-generated or commission-directed assets, the following format is required:

**Required components:**
1. **Subject description** — Who or what, specific enough to be unambiguous
2. **Style specification** — Reference the project's established style
3. **Color palette** — From the project's defined palette
4. **Composition note** — Primary framing, focal point, and spatial arrangement
5. **Atmosphere/mood** — Matches the scene's emotional tone at that moment
6. **Technical specification** — Aspect ratio, resolution target
7. **Negative prompt** — What must not appear in the result

**Standard format:**
```
[Subject: specific description of who/what is depicted]
[Style: project style reference]
[Colors: primary and accent palette colors]
[Composition: framing type, focal point, spatial arrangement]
[Mood: emotional atmosphere matching scene tone]
--ar 16:9
Negative: [list of elements to avoid — visual clutter, style conflicts, etc.]
```

**Prompt quality standard:** A prompt is complete when two different artists or generation systems would produce conceptually similar results from it. A prompt that relies on interpretation or assumption is incomplete.
