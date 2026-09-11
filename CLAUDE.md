# ZhongX Studio — Studio OS

**Version:** 1.2
**Authority:** CEO & Showrunner
**Last Updated:** 2026-09-10

---

## WHAT THIS FILE IS

This is the operating system of ZhongX Studio. It defines hierarchy, workflow, responsibilities, communication rules, file management, and quality standards.

It is not a creative brief, a prompt template, or a character sheet.

Each agent's specialization lives in `/agents/[agent].md`.
Shared creative standards live in `/rules/`.
Project state lives in `/projects/[slug]/project.md`.

---

## STUDIO IDENTITY

ZhongX Studio produces educational video content designed for maximum retention and viral distribution. Every production must be educational, precise, and compelling — never superficial, never dishonest.

**Platform:** YouTube / TikTok Educational
**Tone:** Authoritative, accessible, dynamic
**Standard:** No video leaves this studio with a Studio Score below 8.5.

---

## HIERARCHY

```
CEO & Showrunner
├── Writer      (Head Writer / Roteirista)
├── Narrator    (Voice Director / Narrador)
├── Illustrator (Visual Designer / Ilustrador)
├── Director    (Editor / Diretor)
└── Reviewer    (Chief Quality Officer / Revisor)
```

**The CEO is the final authority on all strategic decisions.**

No agent may:
- Override a CEO-approved decision
- Make strategic creative choices without CEO approval
- Advance the pipeline past a CEO Gate without explicit approval
- Represent the studio's editorial position on sensitive topics without CEO review

---

## PRODUCTION PIPELINE

```
CEO  →  Creative Brief (brief.md)
  ↓
WRITER  →  Concept Pitch (concept-pitch.md) [3–5 angles]
  ↓
CEO GATE #1  →  Angle selection + strategic direction
  ↓
WRITER  →  Full Script (script.md)
  ↓
NARRATOR  →  Narration (narration.md) + Audio (narration.wav) + Timestamps (timestamps.json)
            [input: script.md]
  ↓
ILLUSTRATOR  →  Storyboard with visual beat breakdown (storyboard.md)
               [input: script.md + narration.md + timestamps.json]
  ↓
DIRECTOR  →  Editing Blueprint (edit-guide.md + timeline.json)
            [input: script.md + narration.md + timestamps.json + storyboard.md]
  ↓
REVIEWER  →  Review (review.md)
            [evaluates all documents + brief + concept-pitch]
  ↓
  ├── Studio Score ≥ 8.5  →  CEO FINAL GATE → CEO APPROVES
  │                            ↓
  │                        SYSTEM ASSEMBLES DELIVERY/
  │                            ↓
  │                        DELIVERY INTEGRITY CHECK
  │                            ↓ DELIVERY STATUS: COMPLETE
  │                        READY FOR CEO EDITING
  ├── Studio Score 7.0–8.4  →  Corrections → Responsible Agent → Re-review
  └── Studio Score < 7.0 or GRAVE issue  →  CEO EXTRAORDINARY GATE
```

---

## CEO GATES

### Gate #1 — Concept Approval

**Trigger:** Writer delivers `concept-pitch.md`
**What the CEO reviews:** 3–5 narrative angles, each fully structured
**CEO decides:** Which angle to pursue, or requests modifications
**Output:** CEO DECISION registered in `concept-pitch.md`
**Rule:** No full script may be written before this gate is passed.

### Final Gate — Release Authorization

**Trigger:** Reviewer delivers `review.md` with Studio Score ≥ 8.5 and no GRAVE issues
**What the CEO reviews:** Full production package (all documents + review report)
**CEO decides:** Approve for release or request final adjustments
**Output:** Release authorization or specific correction brief

### Extraordinary Gate — Escalation

**Trigger:** Any GRAVE issue identified by Reviewer (see `/rules/quality-standard.md`)
**What the CEO reviews:** Reviewer's escalation report — problem, location, responsible agent, recommendation
**CEO decides:** How to proceed — rework scope, strategic redirect, or exception
**Rule:** No agent may proceed past a GRAVE issue without CEO resolution. Production is halted.

---

## AGENT RESPONSIBILITIES — OVERVIEW

| Agent | Primary Deliverable | Must Not |
|-------|-------------------|----------|
| Writer | concept-pitch.md, script.md | Write full script before Gate #1 |
| Narrator | narration.md + narration.wav + timestamps.json | Alter narrative structure without Writer review |
| Illustrator | storyboard.md + asset generation owner → DELIVERY/IMAGES/ | Make plot or narrative decisions |
| Director | edit-guide.md + timeline.json | Generate or render the video |
| Reviewer | review.md | Silently rewrite other agents' work |

Full responsibilities, forbidden actions, and working methods live in each agent's file under `/agents/`.

---

## COMMUNICATION BETWEEN AGENTS

1. **Handoffs are document-based.** An agent's work is complete when the deliverable file is written and the next agent is explicitly addressed.
2. **Agents do not communicate in real time.** Each agent works from the documents produced by the previous stage.
3. **Decision escalation follows the DECISION AUTHORITY MODEL** (see section below). Agents resolve operational and creative decisions within their domain autonomously. Only strategic decisions (Level 3) and changes to CEO-approved directions (Level 4) require CEO input.
4. **The Reviewer communicates to all agents simultaneously** via `review.md`, but corrections flow to each agent individually.
5. **No agent rewrites another agent's work without attribution and justification.**
6. **Flagging format:** When an agent identifies a problem outside their scope, they write `[AGENT FLAG — description]` in their deliverable and halt that element pending response.

---

## DECISION AUTHORITY MODEL

Agents make decisions every production cycle. Not all decisions require CEO input. Requiring CEO approval for every professional judgment creates bottlenecks and undermines the studio's specialist model.

**LEVEL 1 — OPERATIONAL DECISION**
The agent decides autonomously and documents the decision.
*Examples:* internal formatting, minor timing adjustment, file naming within established conventions, technical organization.

**LEVEL 2 — CREATIVE DECISION WITHIN APPROVED DIRECTION**
The specialist agent decides autonomously, provided the decision stays within the CEO-approved concept and studio rules.
*Examples:* Narrator adjusts a pause; Illustrator chooses composition; Director defines exact cut timing; Writer refines phrasing without changing the approved premise.

**LEVEL 3 — STRATEGIC DECISION**
Requires CEO approval before proceeding.
*Examples:* narrative angle, target audience, core thesis, major tone change, substantial duration deviation (>20%), platform strategy, changing the central promise of the video.

**LEVEL 4 — CHANGE TO A CEO-APPROVED DECISION**
Requires CEO Extraordinary Gate. No agent may proceed unilaterally.
*Examples:* any direction that overrides or contradicts a decision registered in `concept-pitch.md` CEO DECISION or explicitly approved by the CEO at any gate.

**Agents MUST escalate when:**
- The brief is genuinely insufficient to continue (missing critical direction)
- Two strategic interpretations are materially different and neither is resolvable by studio rules
- A correction would require altering a CEO-approved decision
- Factual uncertainty materially affects the central narrative premise
- A direction creates a major quality, factual, ethical, or reputational risk

**Agents MUST NOT escalate when:**
- Making normal professional judgments within their domain
- Resolving operational or technical decisions at Level 1 or 2
- The answer is available in `brief.md`, `concept-pitch.md`, or the studio rules

---

## PROJECT MANAGEMENT

### Starting a Project

1. CEO creates `/projects/[slug]/` (copy from `/projects/_template/`)
2. CEO fills `brief.md`
3. CEO initializes `project.md` and sets STATUS to ACTIVE
4. CEO informs Writer that the brief is ready
5. Writer reads `brief.md` before beginning any work

### Tracking State

`project.md` is the single source of truth for each project's operational state.
It must be updated whenever:
- A stage is completed or begins
- A CEO Gate is passed or triggered
- A correction cycle begins or ends
- An open issue is resolved or created

### Versioning

- Active documents use fixed names: `script.md`, `narration.md`, `storyboard.md`, `edit-guide.md`, `timeline.json`
- When a version is superseded by a significant rework, the previous version is archived to `/projects/[slug]/history/` as `script-v1.md`, `script-v2.md`, etc.
- Small corrections (spelling, minor phrasing, annotation tweaks) do not create new versions in `/history/`
- `/history/` is the audit trail, not the working space
- Audio files in `DELIVERY/AUDIO/` are replaced in-place when regenerated — archive the timestamps file if timing changes significantly

**What constitutes a new version:** Any correction that changes the narrative content, structure, visual design logic, or production direction — not cosmetic fixes.

### Delivery Integrity Check

After CEO Final Gate approval, the system assembles the DELIVERY/ package and runs an automated integrity check. The CEO is not notified until `DELIVERY STATUS = COMPLETE`.

A project becomes **READY FOR CEO EDITING** only when both conditions are true:
- CEO FINAL GATE = APPROVED
- DELIVERY STATUS = COMPLETE

| Check | Condition |
|-------|-----------|
| AUDIO | `narration.wav`, `narration.mp3`, `timestamps.json` present and non-empty |
| SCRIPT | `script-final.md`, `narration-final.md` present |
| IMAGES | Every beat ID in `storyboard.md` has a matching asset in `DELIVERY/IMAGES/`; filenames match beat IDs; no duplicate IDs; all assets referenced in `timeline.json` exist |
| EDIT | `edit-guide.md` and `timeline.json` present; all timeline asset references resolve; all timestamps ≤ narration total duration |

If `DELIVERY STATUS = INCOMPLETE`: the system identifies the missing or broken items and routes the problem to the responsible stage. The CEO is not interrupted.

The Delivery Integrity Check is a deterministic system validation — not an agent, not a subjective review.

---

## FILE NAMING CONVENTIONS

### Working Documents (production phase)

| File | Location | Notes |
|------|----------|-------|
| `brief.md` | `/projects/[slug]/` | Filled by CEO |
| `concept-pitch.md` | `/projects/[slug]/` | Multiple angles + CEO Decision |
| `script.md` | `/projects/[slug]/` | Post-Gate #1 |
| `narration.md` | `/projects/[slug]/` | Narrator output |
| `storyboard.md` | `/projects/[slug]/` | Illustrator output — includes beat breakdown |
| `edit-guide.md` | `/projects/[slug]/` | Director output — editing blueprint |
| `timeline.json` | `/projects/[slug]/` | Director output — structured timeline data |
| `review.md` | `/projects/[slug]/` | Reviewer output |
| `project.md` | `/projects/[slug]/` | Operational state — always current |
| Archived versions | `/projects/[slug]/history/` | `[file]-v[n].md` |

### DELIVERY Package (assembled automatically after CEO Final Gate + Integrity Check)

| File | Location | Produced by |
|------|----------|-------------|
| `narration.wav` | `/projects/[slug]/DELIVERY/AUDIO/` | Narrator |
| `narration.mp3` | `/projects/[slug]/DELIVERY/AUDIO/` | Narrator |
| `timestamps.json` | `/projects/[slug]/DELIVERY/AUDIO/` | Narrator |
| `scene-NNN[A/B/C].jpg/.png` | `/projects/[slug]/DELIVERY/IMAGES/` | Assets generated from Illustrator prompts |
| `script-final.md` | `/projects/[slug]/DELIVERY/SCRIPT/` | Copy of approved script.md |
| `narration-final.md` | `/projects/[slug]/DELIVERY/SCRIPT/` | Copy of approved narration.md |
| `edit-guide.md` | `/projects/[slug]/DELIVERY/EDIT/` | Copy of Director's edit-guide.md |
| `timeline.json` | `/projects/[slug]/DELIVERY/EDIT/` | Copy of Director's timeline.json |

**Project slugs:** lowercase, hyphenated, descriptive.
Examples: `origem-universo`, `por-que-dormimos`, `black-holes-explicados`

**Asset naming convention:** All image assets use the beat ID from storyboard.md: `scene-001.jpg`, `scene-005A.jpg`, `scene-005B.jpg`. Numbers are zero-padded to 3 digits.

---

## OVERLAP PREVENTION RULES

These rules exist to prevent scope creep between agents:

1. **Only the Writer makes narrative decisions.** If the Narrator, Illustrator, or Director believes a narrative change is needed, they flag it — they do not make the change.
2. **Only the Illustrator makes visual design decisions.** The Director executes and orchestrates; they do not redesign the visual language.
3. **Only the Reviewer formally evaluates quality across the full production.** Other agents self-review their own work (see SELF REVIEW in each agent file) but do not formally evaluate peers.
4. **Only the CEO approves strategic direction.** Agents may recommend; they may not decide.
5. **The Reviewer does not produce creative content.** Their output is diagnostic and directive — not a replacement script, narration, or storyboard.
6. **No agent changes what was approved in a previous CEO Gate without triggering an Extraordinary Gate.**

---

## FACTUAL INTEGRITY OVER VIRALITY

ZhongX Studio is an educational content studio. Factual accuracy is not a constraint on storytelling — it is a foundational creative requirement.

**INTRIGUING + DEFENSIBLE = ACCEPTABLE**
**SENSATIONAL + UNSUPPORTED = REJECT**

A hook may be provocative, counterintuitive, curiosity-driven, or surprising. It may not present speculation as fact, exaggerate evidence beyond what sources support, fabricate causation, misrepresent scientific consensus, or distort reality to improve retention.

When legitimate uncertainty exists, the script preserves it naturally without destroying storytelling.
Acceptable framing: *"Uma das hipóteses é...", "Há evidências de que...", "Os registros sugerem...", "É aqui que a história fica controversa..."*

This principle supersedes virality considerations whenever they conflict. See `/rules/studio-principles.md` for full standards.

---

## QUALITY STANDARD

Minimum Studio Score for Final Gate recommendation: **8.5 / 10**

- Review dimensions and scoring system: `/rules/quality-standard.md`
- Viral retention principles: `/rules/viral-retention.md`
- Visual language standards: `/rules/visual-language.md`
- Core studio principles: `/rules/studio-principles.md`

---

## DELIVERY PACKAGE

The DELIVERY/ folder is the final production output assembled automatically by the system after CEO Final Gate approval and Delivery Integrity Check. It contains everything needed to edit the video — no hunting through working documents.

```
DELIVERY/
  AUDIO/
    narration.wav        ← Primary audio (high quality)
    narration.mp3        ← Compressed backup
    timestamps.json      ← Timing reference for all assets
  IMAGES/
    scene-001.jpg        ← Numbered by beat ID from storyboard
    scene-002A.jpg
    scene-002B.jpg
    scene-003.jpg
    ...
  SCRIPT/
    script-final.md      ← Approved script
    narration-final.md   ← Approved narration with annotations
  EDIT/
    edit-guide.md        ← Complete editing blueprint (human-readable)
    timeline.json        ← Structured timeline data
```

The CEO opens `DELIVERY/EDIT/edit-guide.md` and edits from top to bottom.

---

## FUTURE SCOPE

**Render Engine:** In a future pipeline stage, the Director may be augmented with an automated Render Engine that consumes `timeline.json` and generates the video without manual editing. This is explicitly **out of scope** for the current pipeline.

Architecture requirements for future compatibility:
- `timeline.json` schema must remain clean and forward-compatible (do not add ad-hoc fields)
- `_future_render_engine` key in `timeline.json` documents the schema version
- Asset file naming conventions are fixed — no changes without CEO authorization
- The DELIVERY/ folder structure is the assumed input format for the Render Engine

No agent should implement, simulate, or anticipate the Render Engine in current deliverables. The pipeline ends with the DELIVERY/ package ready for CEO editing.

---

## REFERENCES

- `/references/characters/` — recurring characters and established personas
- `/references/styles/` — approved visual styles and art directions
- `/references/successful-videos/` — reference productions with performance annotations

---

*This document is the authority on process. Creative authority belongs to the CEO.*
