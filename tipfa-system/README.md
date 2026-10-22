# TIPFA system

Two copies of the TIPFA Association Platform, side by side.

| Folder | What it is |
|---|---|
| [`original/`](original/) | The full platform, saved untouched — every file byte-for-byte as it stands on `main` at commit `758685c` ("Enable instagram-agent Claude Code plugin (#57)"), build `v70`. |
| [`crop-calendar/`](crop-calendar/) | A copy of the platform with every feature removed except the crop calendar, which is rebuilt on the association's master crop calendar template. |

Both open in a browser as they are: `original/index.html` and
`crop-calendar/public/index.html`. Neither needs a build step.

## The crop calendar copy

What is kept from the platform: its look and brand system, the front door with
farm and administrator sign-in, the desktop rail and the phone's drawer, the
build stamp and stale-copy warning, and its habit of working from the browser
first and sharing through Firebase only when a project is set up.

What is gone: profiles, harvest plans, orders, the input store, batches and
traceability, advisory, reports, communication, archives, governance and the
platform's per-crop input programme.

### The calendar

It follows the master template (`FAIR FARM CROP CALENDAR MASTER TEMPLATE`):

- one row per planting — greenhouse / block, section, crop, area (m²), notes;
- a timeline of 36 months, January 2026 to December 2028, each split into
  weeks 1–4 (days 1–7, 8–14, 15–21, 22 to the month's end); the window moves a
  year at a time without losing anything;
- each week coloured by stage, in the template's own key and colours: land
  preparation, sowing / nursery, transplanting, vegetative growth, flowering /
  fruit set, harvest (with its kilograms), rotation crop / legumes;
- **TOTAL HARVEST** by month and **HARVEST BY CROP** by month, computed exactly
  as the template's `SUM` and `SUMPRODUCT` formulas compute them.

The whole calendar fits the screen, with no scrolling sideways: the weeks share
the width beside the planting column. **3 years**, **1 year** or **6 months** can
be shown at once (3 years by default); labels that no longer fit step down — a
month's name to its initial, a week's kilograms to its colour, the totals from
months to quarters or half years.

### Planned from the sowing date

Adding a planting of a crop the guide knows asks for the sowing date and the
number of plants, and fills in every week: land preparation, nursery,
transplanting, growth, flowering and each harvest week with its kilograms. Two
sources are used, each for what it covers:

- **When** — the sowing and growth timelines: weeks to transplant size and days
  from sowing to harvest (the middle of each range).
- **How much** — the TIPFA Harvest Ledger: what a harvest week gives one plant,
  how often it is picked and for how many weeks; for herbs, the Greenhouse Yield
  Calculator's 1.2–2.4 kg a plant a season.

Crops: cherry tomato, tomato, capsicum, paprika, habanero (Loleza), sweet melon,
broccoli, cauliflower, onion, garlic, herbs (basil, coriander), herbs (rosemary,
thyme) and avocado. Where the guide has no yield (tomato, onion, garlic,
perennial herbs) the farm may give its own expected kg a plant. The transplanting
date can be given instead of the usual nursery time. Any planned week can still
be changed by hand. The figures are the `CROP_GUIDE` list in
`crop-calendar/public/index.html`.

Weeks can also be entered by hand, three ways: pick a stage and drag across the
weeks (across several plantings at once if they share a stage); click or tap a
single week and choose from its own small menu, whose arrows step a week at a
time; or **Fill weeks** on a planting — one stage, from one week to another.

### However a farm divides its ground

Every farm is stored in the same shape: a list of growing units (greenhouse,
screenhouse, open field or nursery), each with an optional list of blocks. What
a farm sees follows from what it has — nobody chooses a mode:

| The farm | What the calendar shows | What adding a planting asks |
|---|---|---|
| One greenhouse | no greenhouse or block column | nothing about location |
| Several greenhouses | a heading for each greenhouse | which greenhouse |
| One large greenhouse in blocks | a Block column | which block |
| Several greenhouses, some in blocks | headings and a Block column | greenhouse, then block |

This is set up, optionally, under **Greenhouses & blocks**. Because the shape is
the same everywhere, the Secretariat can add every farm's harvest together by
crop and month, and every export has the same columns.

### Excel

- **Export to Excel** writes the master template filled in: the same title,
  columns, colours, key, live formulas, frozen panes, print set-up, and the
  orange mark on the current week. LibreOffice recalculating an export from
  scratch gives the same totals the page shows.
- **Import from Excel** reads a template filled in by hand. Headings are found
  by name; each week's colour is matched to the key; a number in a week is
  harvest kilograms. Greenhouses and blocks named in the file are created as
  needed. A colour that is not in the key is reported, not guessed.
- The Secretariat exports every farm in one workbook: the association's harvest
  by crop on the first sheet, then each farm's calendar on its own sheet.

The Excel library (ExcelJS 4.4.0, MIT — licence in `public/vendor/`) is kept beside the
page, so exporting works without reaching a CDN.

### Accounts and approval

Every account that registers, farm or administrator, waits until an
administrator approves it. The first administrator to register becomes the
system owner and is let in straight away, since somebody has to approve
everyone else. Administrators approve, turn down, suspend and reinstate members
under **Members & approvals**, and oversee every approved farm's calendar, read
only and live, under **Crop calendars**. The Firestore rules enforce all of it.

### Hosting it

`crop-calendar/` is a self-contained package for a developer to host on its own
domain: the site is in `public/`, and Firebase Hosting, Authentication and
Firestore are configured beside it. [`crop-calendar/DEPLOY.md`](crop-calendar/DEPLOY.md)
walks through it step by step. The copy needs a Firebase project of its own;
the guide explains why its rules must not be published over the platform's.

Until `public/firebase-config.js` is filled in, the page runs as a
demonstration: each device keeps its own accounts and calendars.
