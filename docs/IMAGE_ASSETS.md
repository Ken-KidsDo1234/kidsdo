# KidsDo image references and implementation notes

## Purpose

This guide makes the information in the project image files readable and reusable by AI assistants and developers. The images are primarily project notes, historical screenshots, and architecture diagrams. They are references for requirements and system flow, not automatically published website content.

## Source-of-truth order

When references disagree, use this order:

1. Current application code, schemas, and verified runtime behavior.
2. Current project documentation, especially `AI_CONTEXT.md`, `Project.md`, and `ARCHITECTURE.md`.
3. This guide's interpretation of the images.
4. The original image files, which may show older plans or historical incidents.

Do not treat an old screenshot, proposed design, or test value in an image as current production behavior or live content without verification.

## Image inventory

### Project notes and historical screenshots

| Image | Information captured | How to use it |
| --- | --- | --- |
| [`images/image.png`](./images/image.png) | Project summary, current status, priorities for a public home page and separate public sections. | Requirements context; compare with the current route implementation before changing navigation. |
| [`images/image-1.png`](./images/image-1.png) | KidsDo name/feature board: music, pictures, documents, membership, calendar, and public relations; lists Apps Script, Drive, Sheets, HTML, CSS, and JavaScript. | Product scope and terminology, not a production logo file. |
| [`images/image-2.png`](./images/image-2.png) | AI collaboration notes and older feature priorities such as public access, separate pages, comments, chat, and notifications. | Historical roadmap only; confirm priorities in current project docs. |
| [`images/image-3.png`](./images/image-3.png) | File inventory screenshot; several source files are marked as not yet analyzed. | Reminder to inspect current source rather than relying on the old inventory. |
| [`images/image-4.png`](./images/image-4.png) | Historical include-name mismatch: `MemberComms` versus `MemberCommsUI`. | Past incident context; current `Index.html` and actual include names are authoritative. |
| [`images/image5.png`](./images/image5.png) | Examples of suspicious spreadsheet values and a warning about unsafe data. | Security-test context only. Never copy example values into live data or render them as trusted HTML. |
| [`images/image6.png`](./images/image6.png) | Historical investigation of an attachment viewer and a suspected `document.write()` issue. | A hypothesis from an earlier investigation, not a confirmed current root cause. Inspect current code before acting on it. |
| [`images/image7.png`](./images/image7.png) | Notes about an `auditSheetData()` utility that scans Sheets for suspicious values. | Operational/tooling reference; verify the current implementation and permissions before running it. |

### Architecture and workflow diagrams

- [`mermaid-diagram.png`](./images/mermaid-diagram.png): overview from visitor/member/admin through `doGet()`, `Index.html`, public/member UI, server modules, Google Sheets, and Google Drive.
- [`mermaid-diagram (1).png`](./images/mermaid-diagram%20%281%29.png): request sequence for opening the website, loading public data, logging in, managing news, and opening the file library.
- [`mermaid-diagram (2).png`](./images/mermaid-diagram%20%282%29.png): admin news entry and image flow: news metadata in the `News` Sheet, image in the Drive `News` folder, a file ID/URL link, `PublicData.js`, then public display with an image.
- [`mermaid-diagram (3).png`](./images/mermaid-diagram%20%283%29.png): server module map connecting authentication, members, content/calendar, files, dashboard, and admin tools with Sheets/Drive and the website.
- [`mermaid-diagram (4).png`](./images/mermaid-diagram%20%284%29.png): Sheet data areas, including users, settings, news/activities, calendar, staff/awards, documents/links, visitors/popups, and logs.
- [`mermaid-diagram (5).png`](./images/mermaid-diagram%20%285%29.png): news-photo publishing sequence from Admin through Apps Script and Drive/Sheets to public news display.

These diagrams establish the intended separation and data flow:

- Visitors, members, and administrators use the Google Apps Script Web App, served from `Code.js`/`doGet()` and `Index.html`.
- `Index.html`, `PublicPages.html`, and `PublicPagesStyles.html` implement the website UI; `MemberCommsUI.html` is the member communication UI.
- Server modules separate authentication, content, calendar, members, files, dashboards, and administration.
- Google Sheets stores structured records; Google Drive stores actual media/files. Sheet records refer to media through a URL or file ID.
- The public page requests public data from the server; administrative content entry and public display are separate flows.

**Current implementation gap from the image workflow:** the News editor in `Index.html` accepts a `coverImage` URL, and the public page renders it, but the News editor does not currently upload an image directly to the Drive `News` folder. Do not claim that upload flow is complete; preserve the Drive/Sheet linking model when implementing it.

Some diagram labels and layouts predate the current implementation. Use them to understand intent and data flow, not as exact schema or API specifications.

### Additional captures in `docs/`

These are historical lesson/incident captures, not runtime site assets:

- [`image.png`](./image.png): lessons-learned summary.
- [`image-1.png`](./image-1.png): browser investigation notes.
- [`image-2.png`](./image-2.png): correction noting that an earlier browser-frame observation was not confirmed.
- [`image-3.png`](./image-3.png): session-end status from an earlier investigation.

The repository-root [`image.png`](../image.png) is also a historical project/lessons image. Do not assume it is the live site logo or background.

## Website implementation guidance derived from the images

- Keep the public website usable without login; require authentication only for member/admin functions.
- Keep announcements/news, activities, and calendar as distinct public content areas. Public content must be filtered by its publication status on the server.
- Keep structured content in Google Sheets and actual uploaded media in Google Drive; display media only through validated URLs or the existing Drive-backed APIs.
- Preserve the separation between public read-only pages and authenticated management flows.
- Treat user-entered Sheet values as untrusted. Escape text for HTML and validate URLs before rendering links or images.
- Do not publish architecture diagrams, incident screenshots, test data, or internal tooling screenshots as website content. Use them to guide implementation unless the user explicitly requests a public documentation page.
- Local files under `docs/images/` are not automatically loaded by the deployed web app. To show a real image publicly, add it through the supported Drive/content workflow or intentionally embed/reference an approved asset in the app.

## Required reading for AI assistants

Before changing KidsDo UI, content flow, or data handling:

1. Read `Project.md`, `AI_CONTEXT.md`, and `ARCHITECTURE.md`.
2. Read this guide and inspect the relevant original image(s) when their details matter.
3. Confirm the related current code and data schema. Do not implement from an image alone.
4. Record any newly confirmed image-derived requirements here so future assistants can reuse them.
