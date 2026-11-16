# Review of step 11 of plan 02: Reset asks first

Commits reviewed (06d0283..8ffd627):

- 73da36a test: Reset asks first, and only after OK resets (step 11(a))
- 8ffd627 feat: Reset asks first, since it can't be undone (step 11(b))

What was checked:

- **Checks pass.** `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check` at 8ffd627: the build succeeds, Vitest passes 156 of 156 in 13 files, and Playwright passes 31 with 1 skipped. The skipped one is the desktop run of `layout.spec.js` Layout.02, which runs on phone only. `npm install` warned that esbuild's postinstall was blocked; the build worked anyway.
- **The new tests fail at 73da36a, for the expected reason**, in a separate `git worktree`, since removed.
  - Vitest: only `Input.05 Reset asks first, and only after OK calls onReset` fails, with "expected vi.fn() to not be called at all, but actually been called 1 times". Reset calls `onReset` without asking.
  - Playwright: only `reset.spec.js` Input.05 fails, at line 13: expected "H 1,1 to N 2,1: single bond", received "no bond". The cancel didn't stop Reset because no dialog was shown.
  - Every other test passed at that commit.
- **Input.05 against `docs/spec/ui.md:57` and `:71-79`.**
  - The unit test checks the exact question text twice, that cancelling doesn't call `onReset`, and that OK calls it once.
  - The end-to-end test follows the example: Puzzle 2 (Ammonia) with H 1,1 to N 2,1; cancel keeps the Bond and Undo stays enabled; OK gives no bond and Undo is disabled. Both dialogs' text is checked.
- **The plan's Design.**
  - The confirm is in `src/ui/ui.js:27-29`, built the same way as Show solution's and using the same `confirm` option.
  - The JSDoc at `src/ui/ui.js:15` now says "onSolve and onReset come only after the Player confirms."
  - No other interface changed: `app.js`'s `onReset` (`src/app.js:23`) is untouched, and Reset has no keyboard shortcut that could skip the question.
- **Every end-to-end click on Reset.** There are three besides `reset.spec.js`: `tests/e2e/bonding.spec.js:72-73`, `tests/e2e/check.spec.js:102-103` and `tests/e2e/narrative.spec.js:39-40`. Each now registers `page.once("dialog", accept)` right before the click. In the last two, the earlier `once` for Show solution is used up by its own click first, so no listener is left over to answer the wrong dialog. None of them can hang: Playwright dismisses a dialog nobody handles. None passes by luck either: if Reset were dismissed, each one's next assertion would fail. In bonding, the status line wouldn't be the empty text. In check and narrative, the Board would still show the solution, so building it changes nothing (Bond.10) and it never gets marked solved. No other test clicks Reset.
- **Decision 0015** (`docs/decisions.md:189`, "Reset can't be undone, so it asks first"): the code matches it, and Bond.09 (`docs/spec/puzzle.md:123`) is unchanged.
- **The narrative still fits.** "First day" (`docs/spec/narratives.md`) says Noor "clicks Reset and builds Glycine alone". It leaves out the question, as it does for Show solution's, and the test accepts the dialog.
- **The code does what the spec says, and no more:** one confirm with the spec's exact text, and `onReset` only after OK.
- The commit messages follow Conventional Commits and have no attribution.

## Findings

1. **note** `tests/e2e/reset.spec.js:18`: the example's last line is "Then there are no Bonds, and Undo is disabled". The test only checks that H 1,1 to N 2,1 is "no bond". That is the only Bond the test made, so it does show there are no Bonds. Checking that Reset is disabled as well (`await expect(reset).toBeDisabled()`, which needs no Bonds and nothing to undo, Input.03) would state "no Bonds" directly. It would also use the `reset` locator that line 5 sets up. It is optional.
2. **note** `tests/unit/ui/ui.test.js:85-86`: the plan's (a) says "cancelling changes nothing". The unit test checks that `onReset` isn't called after the cancel, but not that the other handlers aren't either. `createUi` changes nothing by itself and only acts through the handlers, so this passes in practice. The end-to-end test covers the Player's view: the Bond is still there and Undo is enabled.

No must-fix or should-fix findings.

## Outcome

1. Kept: the test made only that Bond, so it shows there are none, as the finding says.
2. Kept: `createUi` acts only through its handlers, and the end-to-end test shows the Player's view.
