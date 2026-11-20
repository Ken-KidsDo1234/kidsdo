# Incident report: Kids Do opened but was not interactive

## Audience and purpose

This report is a handoff for future maintainers and AI assistants. It records the confirmed cause of the earlier public-only experience, what was fixed, how it was verified, and how to continue testing without damaging live data.

## Executive summary

The public HTML shell loaded, but the client-side JavaScript failed to parse. The browser could still render static page markup, which made the site appear viewable, while the JavaScript functions for menu navigation, Login, and API calls were unavailable. The confirmed runtime error was `Uncaught SyntaxError: Unexpected token ';'` in the generated Apps Script frame.

The error was traced to comparison operators in included inline scripts being emitted as the HTML entity `&lt;`, for example `out.indexOf(u)&lt;0` and `.length&lt;3`. These are not valid JavaScript operators inside a script. The affected predicates were rewritten to equivalent comparisons that do not contain `<`, then the deployed HTML and browser behavior were checked.

There was a second, separate server-source syntax error in `AdminTools.js` that prevented a source push during the repair. It was fixed so the project could be pushed and deployed; it was a deployment blocker, not the direct reason the already-served page displayed static content without working controls.

The Login dialog and public routes were subsequently verified in the live app. The user later confirmed they could enter Admin and log out. The current web-app deployment is version 33. The user also confirmed the `Black ground2.jpg` background now works.

## Symptoms reported

- The Kids Do home page opened and could be viewed.
- Menu items and other controls did not work.
- The Login page could not be opened.
- The interface looked present, but no meaningful navigation or Admin actions were available.

## Confirmed causes and distinction between them

### 1. Primary runtime cause: invalid generated client JavaScript

The Apps Script HTML service assembled client code from inline scripts and included files. In the generated live page, less-than operators in included code were HTML-escaped. Runtime inspection found examples equivalent to:

```text
out.indexOf(u)&lt;0
out.indexOf(cover)&lt;0
.length&lt;3
```

`&lt;` is not decoded as a JavaScript operator in a script block. The browser therefore stopped parsing that script at the syntax error. Functions declared in the failed script, including `openLogin()`, were not defined. Static HTML could still render, but buttons depending on those functions could not operate.

**Why it looked like a read-only website:** rendering the HTML shell does not prove that the client script parsed. The failure happened after HTML delivery, in the browser's JavaScript parsing stage.

**Fix applied:** rewrote the affected predicates without `<` (for example, `indexOf(...) === -1` and logically equivalent length validation using `>=`). The changes preserved the intended conditions while avoiding escaping in the inline-script context.

### 2. Separate deployment blocker: malformed source in `AdminTools.js`

During repair, `AdminTools.js` contained prose and Markdown code-fence text before `auditSheetData()`. Apps Script rejected the project with a syntax error around line 84, and `clasp push` could not proceed.

**Fix applied:** removed the malformed duplicate prose/code block, parsed the source, then pushed all 16 project files. This made deployment possible. Do not confuse this source/push error with the browser's generated-script error; both needed to be resolved, but they occurred at different stages.

### 3. Separate page-specific bug: missing `safeExternalUrl()`

After Login and the main routes were working, Contact failed with `ReferenceError: safeExternalUrl is not defined`.

**Fix applied:** added the URL helper in `Index.html`, allowing only absolute HTTP/HTTPS URLs and rejecting unsupported or malformed values. This was fixed in version 27 and affected Contact, not the original Login failure.

### 4. Not the cause of the Login/menu failure

- Empty News, Activities, Staff, or other content lists mean there are no published records; they do not explain a JavaScript syntax error or an inoperative Login button.
- Google Drive sharing affected anonymous previews of some library pictures. Music and Document folders returned zero files at the time of inspection. These were library-content/access findings, not the cause of Login being unavailable.
- The background-image filename/location issue was separate. The actual file was `Black ground2.jpg`, not `.png`; version 31 now finds it in the configured folder tree.

## Timeline and deployment evidence

### Included-script repair

- Live runtime inspection found escaped `&lt;` operators in scripts included from `PublicPages.html` and `MemberCommsUI.html`.
- The affected comparisons were rewritten and retested to preserve their original logic.

### Version 26: syntax repair and Login smoke test

- Removed malformed prose and a code fence from `AdminTools.js`.
- Pushed the 16 project files and updated the existing web-app deployment to version 26.
- Live `/exec` returned HTTP 200 and contained the Login markup.
- The served HTML check found neither literal `&lt;` nor `&#43;` entities in the inspected script output.
- Browser smoke test confirmed the public site rendered, `openLogin`, `showPublic`, `openLibrary`, and `start` were defined in the app frame, Login displayed username/password fields, and the News route worked.
- No `Unexpected token ';'` error occurred in that smoke test. The browser also logged a separate message `Dr`, which was not established as the cause of the Login issue.

### Version 27: Contact route

- Added `safeExternalUrl()` to `Index.html`.
- Verified the Contact route no longer threw the missing-helper error and the News route still rendered.

### Versions 28-31: background image, separate from Login

- Replaced the animated background with a Drive-served static image while leaving Login/Admin code unchanged.
- Version 29 looked for `Black ground2.png`, but the configured folder contained no exact match.
- Version 30 searched the configured folder and its subfolders; it still found no PNG.
- The user clarified the actual name was `Black ground2.jpg`.
- Version 31 now looks for the JPEG in the configured folder tree. Live browser inspection confirmed an active `data:image/jpeg` background on `.adventure-world` with `background-size: cover`; the user confirmed it displays.

### Versions 32-33: remove visible test markers

- Removed the red `TEST VERSION 20` banner and the adjacent literal `...` placeholder from `Index.html`.
- Deployed version 33 to the existing web-app deployment.
- Live browser reload confirmed neither marker appears and the home page still renders.

## How to diagnose this class of failure next time

1. **Record the exact deployment and symptom.** Check the active `/exec` URL and `clasp deployments`; do not assume the deployed version matches local files.
2. **Inspect the correct browser frame.** Apps Script wraps the app in nested frames. Inspect the inner app frame (`userHtmlFrame`/`userCodeAppPanel`), not only the outer `script.google.com` page.
3. **Check the earliest console error first.** A syntax error early in one inline script can prevent all later declarations in that script from being created. Do not start by debugging individual button handlers or API methods until scripts parse.
4. **Inspect generated HTML, not only source files.** Apps Script templates and included HTML can transform characters. Search script output for entities such as `&lt;` or `&#43;`; ordinary static source parsing will not catch errors introduced during template assembly.
5. **Parse the assembled scripts.** Validate each server `.js` file and the actual composed client script. `node --check` on an isolated source file is useful but does not replace checking the generated HTML.
6. **Keep the fix semantically equivalent.** If an operator is escaped by the template context, rewrite only the affected predicate and test edge cases such as the index-not-found case and minimum-length validation.
7. **Check Apps Script server syntax separately.** A malformed `.js` source file can prevent `clasp push`, even if the browser-side issue is different.
8. **Push, create a version, and update the existing deployment.** For this project, use the deployment ID recorded below. Prefer explicit long options:

   ```powershell
   clasp push
   clasp version "Short change description"
   clasp deploy --deploymentId <existing-deployment-id> --versionNumber <new-version> --description "Short change description"
   clasp deployments
   ```

   Avoid lowercase `-v` for the deployment version: in the installed `clasp` CLI it printed the CLI version and did not redeploy. Verify `clasp deployments` shows the expected version.
9. **Smoke test the live page.** Confirm the public home page, Login dialog, a public route, and the affected Admin/API action. Do not enter credentials in an automated smoke test; the account owner can verify a real login separately.
10. **Distinguish empty data from broken navigation.** A route that opens and shows an empty state is functioning even if no records exist. A click that does nothing or raises a JavaScript error is a different failure.

## Current state and next work

- Active web-app deployment ID: `AKfycby4k3dX7c4T2-wCrNqoZbbKiC7bktXdwckAvOn7i_bfIM2jot2DmNYPJove9sXbtFea`
- Active deployment version: 33, `Remove homepage test markers`
- The user reports that Login, Admin entry/logout, and public top-menu navigation work.
- The user reports that Admin modules for News, Activities, and Banner are reachable and public menu links are clickable.
- No real content has been added yet; empty public lists are expected until content is entered.
- Next planned work: test create/edit/public display/delete for Activities, Staff, Calendar, and files in the existing Picture, Music, and Document Drive folders. Use clearly marked test items, do not overwrite existing records/files, and clean up test items after verification. Record Drive visibility/preview behavior separately from Admin CRUD behavior.

## Relevant project files

- `../Index.html` — Login flow, client API dispatch, public navigation, and `safeExternalUrl()`.
- `../PublicPages.html` — Public route client scripts.
- `../MemberCommsUI.html` — Member communications client scripts.
- `../AdminTools.js` — Admin utilities; malformed prose/code-fence source was removed.
- `../Files.js` — Drive library APIs and website background lookup.
- `./LESSONS_LEARNED.md` — Chronological investigation notes and previous test findings.
