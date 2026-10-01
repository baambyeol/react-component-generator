# PR Body Template (English)

Use this for overseas open-source projects. `<...>` marks a placeholder. Delete any section that does not apply instead of leaving it empty, and do not leave the guidance text in the body.

```markdown
## Summary

<What this PR does, in 1-3 sentences>

## Motivation

<Why this change is needed: the problem, the requirement, or the linked issue>

Closes #<issue number>

## Changes

- <Change 1>
- <Change 2>

## Testing

- [ ] <Tests/checks you ran, and their results>
- [ ] <Manual verification steps>

## Notes for Reviewers

<Areas that need careful review, trade-offs, known limitations>

## Screenshots

<Only if there are UI changes>
```

## Writing rules

- Check a box only for checks you actually ran and that passed. If a check failed or was not run, leave it unchecked and say why.
- Never invent issue numbers or results.
- Call out breaking changes in their own paragraph under Motivation.
