# Letterboxd • Social film discovery.

## Mission
Create implementation-ready, token-driven UI guidance for Letterboxd • Social film discovery. that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Letterboxd • Social film discovery.
- URL: https://letterboxd.com/
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Typography scale: `font.size.xs=11px`, `font.size.sm=12px`, `font.size.md=13px`, `font.size.lg=15px`, `font.size.xl=16px`, `font.size.2xl=17.6px`, `font.size.3xl=18px`, `font.size.4xl=22px`
- Color palette: `color.text.primary=#667788`, `color.text.secondary=#99aabb`, `color.text.tertiary=#ffffff`, `color.text.inverse=#aabbcc`, `color.surface.base=#000000`, `color.surface.muted=#00ac1c`, `color.surface.raised=#2c3440`
- Spacing scale: `space.1=2px`, `space.2=3px`, `space.3=4px`, `space.4=5px`, `space.5=5.2px`, `space.6=6px`, `space.7=6.5px`, `space.8=7px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=3px`, `radius.md=4px` | `shadow.1=rgba(221, 238, 255, 0.25) 0px 0px 0px 1px inset`, `shadow.2=rgba(255, 255, 255, 0.3) 0px 1px 0px 0px inset` | `motion.duration.instant=100ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`, `motion.duration.slow=500ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (290), buttons (37), inputs (28), cards (13), navigation (10), lists (10), tables (2).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
