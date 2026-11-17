<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0 (MINOR: materially expanded guidance)
- Modified principles:
  - VI. Tested Logic and Components (title unchanged): component tests now use Testing
    Library (@testing-library/react) on jsdom
- Modified sections:
  - Technology & Project Constraints: Testing is now Vitest + Testing Library + jsdom
  - Development Workflow & Quality Gates: `/speckit-clarify` added after `/speckit-specify`
- Added sections: none
- Removed sections: none
- Templates checked (not modified by this command; they read the constitution at runtime):
  - .specify/templates/plan-template.md ✅ "Constitution Check" gate applies as-is
  - .specify/templates/spec-template.md ✅ no conflict
  - .specify/templates/tasks-template.md ✅ no conflict; test tasks required by Principle VI
- Follow-up TODOs: none
-->

# Keep Constitution

Keep is a feedback tool. Users submit feedback through an embeddable widget; the team reviews
and handles it in an admin dashboard. The code lives in the `feedback` monorepo:

- `apps/admin` – admin dashboard (Next.js App Router)
- `apps/demo-site` – test page for the widget
- `packages/widget` – embeddable script
- `convex` – backend

## Core Principles

### I. Design Fidelity

- UI MUST follow the Figma design referenced in each spec, whether provided as screenshots or
  via the Figma MCP.
- Colors, spacing, radii and typography MUST come from the tokens and classes in
  `apps/admin/app/globals.css`. New colors, spacing values or type styles MUST NOT be invented.
- If a design needs a value that `globals.css` lacks, the value MUST be taken from Figma and
  added to `globals.css` as a token in the same change, never hard-coded in a component.
- Figma governs visual design. UI copy MUST be in Danish (see Technology & Project
  Constraints), even where a Figma frame shows English text.

**Rationale**: One visual source of truth keeps the product consistent and makes design changes
a single-file edit.

### II. Single Source of Data Types

- Shared data types (feedback, users, platforms, statuses, attachments, etc.) MUST be defined in
  exactly one module in `apps/admin`, and MUST mirror the planned Convex schema.
- Duplicate or ad-hoc type definitions for the same entity MUST NOT exist elsewhere.
- Once `convex/schema.ts` exists, code MUST use Convex-generated types
  (`convex/_generated/dataModel`) and the handwritten equivalents MUST be removed.

**Rationale**: Types that mirror the schema from day one make the move from mock data to Convex
a swap, not a rewrite.

### III. Untrusted Feedback Content (NON-NEGOTIABLE)

- All feedback content (text, names, emails, page paths, file names, metadata) comes from
  untrusted users and MUST be rendered as text only.
- `dangerouslySetInnerHTML` MUST NOT be used anywhere. In `packages/widget` and any non-React
  code, `innerHTML`, `outerHTML`, `insertAdjacentHTML` and `document.write` MUST NOT be used with
  user-supplied data; use `textContent` or DOM APIs instead.
- User-supplied URLs MUST be checked to use `http:` or `https:` before being used in `href` or
  `src`.

**Rationale**: The admin dashboard displays content written by anyone who can load the widget;
rendering it as HTML would expose admins to stored XSS.

### IV. Simplicity

- Solutions MUST be the simplest that meet the spec. No speculative abstractions or features.
- New dependencies MUST NOT be added unless the plan states a clear reason and why existing
  tools (the platform, Next.js, Convex, Tailwind) are not enough.

**Rationale**: A small dependency footprint keeps the codebase easy to understand, upgrade and
secure.

### V. Small, Prop-Driven Components

- Components MUST be small, focused and reusable.
- Components MUST receive their data via props and MUST NOT import mock data or fetch data
  themselves. Data loading belongs in pages/containers.
- Replacing mock data with Convex queries MUST NOT require changing a presentational component.

**Rationale**: Separating data from presentation lets the UI be built against mock data now and
connected to Convex later without rewrites.

### VI. Tested Logic and Components

- New logic and new components MUST have tests in the same change: Vitest for logic, and
  Vitest with Testing Library (`@testing-library/react`) on jsdom for components.
- Tests MUST cover the behavior described in the spec's acceptance scenarios, including the
  text-only rendering required by Principle III where user content is displayed.

**Rationale**: Tests written alongside the code are what make later refactors (such as the
Convex swap) safe.

## Technology & Project Constraints

- **Language**: TypeScript with `strict` mode enabled in every package. `any` MUST NOT be used
  to silence type errors.
- **Package manager**: npm only. Lockfiles from other package managers MUST NOT be committed.
- **Testing**: Vitest + Testing Library (`@testing-library/react`) + jsdom (sanctioned by
  Principle VI; no separate justification needed).
- **Styling**: Tailwind CSS v4 plus the tokens and component classes in
  `apps/admin/app/globals.css` (Principle I).
- **Next.js**: `apps/admin` uses a recent Next.js version with breaking changes. Before writing
  Next.js code, read the relevant guide in `apps/admin/node_modules/next/dist/docs/`, as
  required by `apps/admin/AGENTS.md`.
- **UI language**: All user-facing text MUST be in Danish. Code, identifiers and comments are in
  English.

## Development Workflow & Quality Gates

- Features follow the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan`
  → `/speckit-tasks` → `/speckit-implement`.
- Each spec MUST reference the Figma design (screenshot or Figma link) for any UI it
  introduces.
- Each plan MUST pass the Constitution Check against all six principles, and MUST list any new
  dependency with its justification (Principle IV).
- Before a change is considered done: `npm run lint`, type checking (`tsc --noEmit` or
  `next build`) and the Vitest suite MUST pass in every affected package.

## Governance

- This constitution supersedes other practices and conventions in the repository. Where a spec,
  plan or task conflicts with it, the constitution wins.
- Amendments are made with `/speckit-constitution`, MUST update the Sync Impact Report and
  version line, and MUST be committed separately from feature work.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR
  for adding a principle or section or materially expanding guidance, PATCH for clarifications
  and wording.
- Every plan's Constitution Check and every review MUST verify compliance. A deviation MUST be
  recorded in the plan's Complexity Tracking table with its justification, or it is not allowed.
- Runtime development guidance for the admin app lives in `apps/admin/AGENTS.md`.

**Version**: 1.1.0 | **Ratified**: 2026-11-17 | **Last Amended**: 2026-11-17
