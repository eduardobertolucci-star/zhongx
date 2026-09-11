# ZhongX Studio — Studio OS

**Version:** 1.0
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
NARRATOR  →  Narration (narration.md)
            [input: script.md]
  ↓
ILLUSTRATOR  →  Storyboard (storyboard.md)
               [input: script.md + narration.md]
  ↓
DIRECTOR  →  Direction (direction.md)
            [input: script.md + narration.md + storyboard.md]
  ↓
REVIEWER  →  Review (review.md)
            [evaluates all documents + brief + concept-pitch]
  ↓
  ├── Studio Score ≥ 8.5  →  CEO FINAL GATE
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
| Narrator | narration.md | Alter narrative structure without Writer review |
| Illustrator | storyboard.md | Make plot or narrative decisions |
| Director | direction.md | Override approved script or storyboard structure |
| Reviewer | review.md | Silently rewrite other agents' work |

Full responsibilities, forbidden actions, and working methods live in each agent's file under `/agents/`.

---

## COMMUNICATION BETWEEN AGENTS

1. **Handoffs are document-based.** An agent's work is complete when the deliverable file is written and the next agent is explicitly addressed.
2. **Agents do not communicate in real time.** Each agent works from the documents produced by the previous stage.
3. **Questions or blockers go to the CEO.** No agent resolves ambiguity by assuming. If a decision requires CEO input, the agent pauses and flags it.
4. **The Reviewer communicates to all agents simultaneously** via `review.md`, but corrections flow to each agent individually.
5. **No agent rewrites another agent's work without attribution and justification.**
6. **Flagging format:** When an agent identifies a problem outside their scope, they write `[AGENT FLAG — description]` in their deliverable and halt that element pending response.

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

- Active documents use fixed names: `script.md`, `narration.md`, `storyboard.md`, `direction.md`
- When a version is superseded by a significant rework, the previous version is archived to `/projects/[slug]/history/` as `script-v1.md`, `script-v2.md`, etc.
- Small corrections (spelling, minor phrasing, annotation tweaks) do not create new versions in `/history/`
- `/history/` is the audit trail, not the working space

**What constitutes a new version:** Any correction that changes the narrative content, structure, visual design logic, or production direction — not cosmetic fixes.

---

## FILE NAMING CONVENTIONS

| File | Location | Notes |
|------|----------|-------|
| `brief.md` | `/projects/[slug]/` | Filled by CEO |
| `concept-pitch.md` | `/projects/[slug]/` | Multiple angles + CEO Decision |
| `script.md` | `/projects/[slug]/` | Post-Gate #1 |
| `narration.md` | `/projects/[slug]/` | Narrator output |
| `storyboard.md` | `/projects/[slug]/` | Illustrator output |
| `direction.md` | `/projects/[slug]/` | Director output |
| `review.md` | `/projects/[slug]/` | Reviewer output |
| `project.md` | `/projects/[slug]/` | Operational state — always current |
| Archived versions | `/projects/[slug]/history/` | `[file]-v[n].md` |

**Project slugs:** lowercase, hyphenated, descriptive.
Examples: `origem-universo`, `por-que-dormimos`, `black-holes-explicados`

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

## QUALITY STANDARD

Minimum Studio Score for Final Gate recommendation: **8.5 / 10**

- Review dimensions and scoring system: `/rules/quality-standard.md`
- Viral retention principles: `/rules/viral-retention.md`
- Visual language standards: `/rules/visual-language.md`
- Core studio principles: `/rules/studio-principles.md`

---

## REFERENCES

- `/references/characters/` — recurring characters and established personas
- `/references/styles/` — approved visual styles and art directions
- `/references/successful-videos/` — reference productions with performance annotations

---

*This document is the authority on process. Creative authority belongs to the CEO.*
