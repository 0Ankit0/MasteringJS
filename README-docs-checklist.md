# Documentation QA Checklist

Use this checklist for every tutorial page update.

## Layout and style
- [ ] Uses Bootstrap `5.3.3` CDN (CSS + `bootstrap.bundle.min.js` when needed).
- [ ] No legacy Bootstrap 4 attributes (`data-toggle`, `data-target`).
- [ ] No jQuery dependency unless explicitly required for the demo.
- [ ] Consistent structure: heading, lead paragraph, sections, example block.

## Content quality
- [ ] Beginner-friendly intro explains **what problem** the API solves.
- [ ] Includes a concise "when to use" section.
- [ ] Includes a short step-by-step flow.
- [ ] Includes at least one practical, minimal code example.
- [ ] Includes common pitfalls or best-practice notes.

## API safety and compatibility
- [ ] Uses feature detection before API usage.
- [ ] Mentions secure-context requirement if applicable (`https`).
- [ ] Mentions permission/user-gesture requirements if applicable.
- [ ] Includes fallback behavior guidance for unsupported browsers.

## Accessibility and UX
- [ ] Inputs and buttons have clear labels.
- [ ] Async demo output is visible and understandable.
- [ ] Keyboard interaction is possible where relevant.

## Consistency and links
- [ ] Overview and example pages link to each other when both exist.
- [ ] Code snippets align with the live demo behavior.
- [ ] File title, heading, and navbar label are consistent.
