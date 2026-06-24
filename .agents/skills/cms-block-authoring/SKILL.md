---
name: cms-block-authoring
description: Author or modify an Umbraco Block List / Block Grid block component. Triggers on requests to add a new block, fix an existing block, or implement a block from a payload + screenshot.
---

# CMS Block Authoring (Umbraco)

Use this skill whenever the user asks to add a new Umbraco block, fix one, or
implement a block from a sample payload. The core flow is stack-agnostic;
project-specific token names and file paths live in `project-bindings.md` —
that's the only file to edit when porting this skill to another project.

This skill is the per-block companion to the broader `umbraco-headless-frontend`
skill. It assumes the registry, renderers, types, and design system are already
in place.

## Flow

1. **Intake.** Require the sample block payload (`content.properties` and
   `settings.properties`) plus either a reference screenshot, a written spec,
   a Figma reference, or a link to a live page. If none, follow
   `references/design-workflow.md` to propose visual directions first.
2. **Anatomy.** Read `references/block-anatomy.md` for `BlockComponentProps`,
   how the registry dispatches, and when to use `silentBlockAliases`.
3. **Settings.** Read `references/settings-conventions.md` for the standard
   settings vocabulary (`fullWidth`, `containerWidth`, `contentWidth`,
   `backgroundColor`, margins, anchor) and the canonical wrapper JSX.
4. **Rich text (if applicable).** If the block renders an RTE field, follow
   `references/rich-text-checklist.md` exactly — typography plugin install,
   `RichTextRenderer` usage, prose classes, dark-bg invert set.
5. **Project bindings.** Read `references/project-bindings.md` for this
   project's concrete paths and tokens.

## Cross-project reuse

To use this skill in another project on the same Umbraco + TanStack Start stack:

1. In the destination project, ask the agent to copy
   `.workspace/skills/cms-block-authoring/` from the source project
   (cross-project file reads are one-way: other → current).
2. Place the copy under `.agents/skills/cms-block-authoring/`.
3. Edit `references/project-bindings.md` with the destination project's paths
   and brand tokens.
4. Apply via `skills--apply_draft`.

The other reference files should not need changes — they describe the Umbraco
block pattern, not project-specific values.
