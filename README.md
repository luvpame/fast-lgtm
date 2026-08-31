# Fast LGTM

Fast LGTM adds an `LGTM` button next to GitHub’s review control on GitHub pull request pages.

The button opens GitHub’s standard review panel, selects `Approve`, replaces the review body with a saved Markdown template, and places the caret at `{{cursor}}`. It never submits the review for you.

## Install

1. Install dependencies and build the extension.

   ```bash
   bun install
   bun run build
   ```

2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose `.output/chrome-mv3` from this project.

## Use

1. Open another user’s pull request. Fast LGTM follows GitHub’s review surface on the pull request page, including the `Files changed` and `Changes` views.
2. Select `LGTM` next to GitHub’s `Review changes` or popup `Submit review` control.
3. Add any review-specific note at the caret.
4. Review the prepared text and submit it with GitHub’s standard `Submit review` button.

Fast LGTM leaves pending inline comments to GitHub’s normal review flow. If GitHub does not offer an `Approve` option, the extension shows an error and hides its button for that page.

## Configure the template

Open Fast LGTM from Chrome’s extensions menu, edit the Markdown, and select `Save`.

- The template must contain visible text.
- `{{cursor}}` is optional.
- If present, `{{cursor}}` may appear only once and is removed before insertion.
- Without `{{cursor}}`, the caret moves to the end of the inserted text.

The template is stored with `chrome.storage.sync`.

## Permissions and privacy

Fast LGTM requests only:

- `storage`, for the synced template.
- Access to `https://github.com/*`, so it can follow GitHub’s in-page navigation and add the review shortcut.

The extension has no analytics, GitHub token, background API client, or external data service. It does not submit reviews automatically.

## Development

```bash
bun run dev
bun run format
bun run lint
bun run typecheck
bun run test
bun run build
bun run check
```

Create a distributable archive with:

```bash
bun run zip
```

## Manual smoke test

After loading the unpacked build:

1. Open a pull request at its base URL and at both `/files` and `/changes` when available.
2. Confirm that one green `LGTM` button appears next to `Review changes` or popup `Submit review`.
3. Navigate between `Conversation` and the diff page without a full reload, then confirm the button unmounts and returns once.
4. Save a template with `{{cursor}}`, select `LGTM`, and confirm that GitHub opens its review panel with `Approve` selected.
5. Confirm that existing review text is replaced, the marker is absent, and the caret is at the marker’s former position.
6. Save a template without the marker and confirm that the caret moves to the end.
7. Open a pull request where `Approve` is unavailable and confirm that an error remains visible while the `LGTM` button disappears.
8. Confirm that Fast LGTM never clicks GitHub’s final review submission button.

## Compatibility note

GitHub does not publish a stable DOM contract for its review controls. Fast LGTM follows the review surface on the base pull request page, the classic `/files` page, and the newer `/changes` page, including the popup `Submit review` opener, through multiple structural and accessible-name fallbacks, but a future GitHub UI update may require selector changes.
