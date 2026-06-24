# Design Workflow

## When to skip design directions

Skip `design--create_directions` when the user has provided any of:

- A reference screenshot.
- A Figma reference.
- A written spec.
- A link to a live page. (If only a link is given, capture a screenshot of
  the referenced section for context before implementing.)

In those cases implement directly from the reference.

## When to generate directions

If none of the above are provided, gather the lightweight block design spec
(shape, size, alignment, padding, background, margins) per
`mem://preferences/block-spec`, then call `design--create_directions` with
2–3 options. Let the user pick before implementing.

## Intake checklist

Before writing the component, confirm:

1. Sample block payload — `content.properties` and `settings.properties`.
2. Visual reference — screenshot, Figma, spec, or live page link.
3. Which settings fields the block exposes (so the wrapper handles them).
4. Whether the block renders an RTE field (triggers the rich-text checklist).
