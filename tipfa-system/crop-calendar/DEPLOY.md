# TIPFA Crop Calendar — deployment guide

For the developer hosting the crop calendar on its own domain. Everything needed
is in this folder.

## What this is

A static web app — one HTML page with its styles and script inside it — backed
by Firebase:

- **Firebase Authentication** (email and password) for farm and administrator accounts.
- **Cloud Firestore** for the accounts' approval status and every farm's calendar.
- **Firebase Hosting** to serve the page on your domain (any static host works — see
  [Hosting somewhere else](#hosting-somewhere-else)).

There is no server code, no build step and nothing to install on the server. The
Firebase SDK is loaded from Google's CDN; the only other library, ExcelJS, is in
`public/vendor/`.

```
crop-calendar/
├── public/                  ← the website: deploy this folder
│   ├── index.html           the whole app
│   ├── firebase-config.js   the project's web config (you fill this in)
│   ├── 404.html
│   ├── assets/brand/        TIPFA logos
│   └── vendor/              ExcelJS 4.4.0 (MIT licence beside it)
├── firestore.rules          the security rules — they are what protects the data
├── firestore.indexes.json   no custom indexes are needed
├── firebase.json            hosting and rules configuration, cache and security headers
├── .firebaserc              which Firebase project to deploy to (you fill this in)
└── DEPLOY.md                this guide
```

## How accounts work

Read this before going live; step 6 depends on it.

- **Every new account waits for approval.** A farm that registers sees a
  "waiting for approval" page until an administrator approves it. It can't open
  or change a calendar until then.
- **Administrators approve, turn down, suspend and reinstate** farms and other
  administrators, and can remove a farm for good, under **Members & approvals**. Every decision is recorded with
  who made it and when.
- **The first administrator to register becomes the system owner** and is approved
  automatically, because somebody has to approve everyone else. Every later
  administrator waits for approval like a farm. Nobody can suspend the owner, and
  nobody can change their own status.
- **Administrators oversee every approved farm's calendar, read only**, live as the
  farms edit it. They see the association's harvest added up by crop and month,
  and can export any farm, or all of them, to Excel.
- **Registering needs a sign-up code** from the Secretariat: one code for farms, a
  different one for administrators. The codes are stored where no browser can read
  them; the security rules check them.

All of this is enforced by `firestore.rules`, not just by what the page shows.
Those rules were tested against the Firebase emulator before handover, including
attempts to bypass them with direct API calls.

## Step 1 — Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and click
   **Add project**. Give it a name of its own, e.g. `tipfa-crop-calendar`.

   > **Use a new project.** Do not deploy into `tipfa-28e23`, which runs the full
   > TIPFA platform. A Firestore database has one set of rules, and deploying these
   > would replace the platform's rules and lock the platform out of its own data.

2. The free **Spark** plan is enough. It allows 50,000 database reads and 20,000
   writes a day, and 10 GB of hosting storage; an association of a few hundred
   farms stays far inside that. No payment card is needed.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
4. **Build → Firestore Database → Create database → Start in production mode.**
   Choose the location nearest Tanzania that the console offers, e.g.
   `africa-south1` (Johannesburg) if listed, otherwise `europe-west1`. The location
   cannot be changed later.

## Step 2 — Put the project's web config in the site

1. **Project settings** (gear icon) → **Your apps** → the web icon `</>` → register an
   app (any nickname; Firebase Hosting can be ticked or not).
2. Firebase shows a `firebaseConfig` object. Copy its values into
   `public/firebase-config.js`, replacing `null`:

   ```js
   window.TIPFA_CC_FIREBASE_CONFIG = {
     apiKey: "AIza…",
     authDomain: "tipfa-crop-calendar.firebaseapp.com",
     projectId: "tipfa-crop-calendar",
     storageBucket: "tipfa-crop-calendar.firebasestorage.app",
     messagingSenderId: "…",
     appId: "1:…:web:…"
   };
   ```

   These values are public by design; every Firebase web app ships them. The rules
   are what protect the data. **Never** add a service account key to the site or
   the repository.

3. Put the same project ID in `.firebaserc`, replacing
   `REPLACE-WITH-YOUR-FIREBASE-PROJECT-ID`.

## Step 3 — Deploy the site and the security rules

You need Node.js 18 or newer.

```bash
npm install -g firebase-tools
firebase login
cd tipfa-system/crop-calendar
firebase deploy
```

`firebase deploy` publishes three things: the site (`public/`), the security rules
(`firestore.rules`) and the indexes file. It prints the live address when it
finishes: `https://<project-id>.web.app`.

If you only change the site later, `firebase deploy --only hosting` is enough. If you
only change the rules, use `firebase deploy --only firestore:rules`.

## Step 4 — Create the sign-up codes

The rules check every registration against a document no browser can read. Nobody
can register until it exists.

1. **Build → Firestore Database → Data → Start collection**
2. Collection ID: `calendarSettings` → **Next**
3. Document ID: type `signup` (do not use auto-ID)
4. Add two fields, both of type **string**:
   - `farmCode` — the code the Secretariat gives to farms
   - `operatorCode` — the code for administrators. Make it different, and treat it
     like a staff password.
5. **Save**

The codes can be changed at any time, in the same place. Changing a code doesn't
affect accounts that already exist.

## Step 5 — Connect your domain

1. **Build → Hosting → Add custom domain**. Enter the domain, e.g.
   `calendar.tipfa.co.tz`.
2. Add the DNS records Firebase shows at the domain's DNS provider: a TXT record to
   prove ownership, then the A records it lists. Firebase issues the HTTPS
   certificate itself; this can take from a few minutes to 24 hours.
3. **Build → Authentication → Settings → Authorized domains → Add domain** and add
   the same domain. Check that it is listed even if Firebase added it for you;
   password-reset links depend on it.

## Step 6 — Create the first administrator, before anyone else

The first administrator account becomes the **system owner**. Do this as soon as
the site is live, **before the codes are shared with anyone**:

1. Open the site → **Administrator** → **New administrator? Create your own account**.
2. Register the Secretariat's lead person with the administrator code.
3. They land straight in the console, marked **System owner**.

Every other administrator who registers afterwards waits until an approved
administrator approves them.

**If the wrong person became owner,** fix it in the console (console edits are not
subject to the rules):

1. In **Authentication → Users**, find the right person's user UID.
2. In Firestore, set `calendarSettings/owner` → field `uid` to that UID.
3. Set `calendarOperators/<that UID>` → field `status` to `approved`.

## Step 7 — Check it end to end before announcing it

Use a real phone for this, both an iPhone (Safari) and an Android phone (Chrome),
as well as a computer. The app was tested here in Chromium on desktop and phone
sizes; Safari and Firefox were not available in the test environment.

- [ ] The site opens on the domain over `https://`, and the sign-in screen does
      **not** show "No shared database is set up".
- [ ] Register a test farm with the farm code. It lands on "waiting for approval".
- [ ] As the owner, **Members & approvals** shows it waiting, with a count on the
      menu. Approve it. The farm's open page switches to its calendar by itself.
- [ ] As the farm, add a cherry tomato planting with a sowing date and a number of
      plants; its weeks and harvest kg fill in. Change a week by hand. As the
      owner, **Crop calendars** shows it.
- [ ] **Export to Excel** downloads a file that opens in Excel in the template layout.
- [ ] Register a second administrator. It waits; approve it from the owner.
- [ ] Suspend the test farm. Its page shows "access paused".
- [ ] **Forgotten your password?** sends an email that arrives (check spam).
- [ ] Remove the test accounts (see [Removing an account](#removing-an-account)).

## Running it

### Approving members
New registrations appear under **Members & approvals**, with a count on the menu,
live for any administrator signed in. There is no email notification of new
registrations; sending email needs Cloud Functions, which needs the paid Blaze plan.

### Removing an account
Under **Members & approvals → Farms**, **Remove** deletes a farm and its whole
calendar for good (an approved administrator only; export it to Excel first if
it may be needed). **Suspend** is the way to keep a farm out *and* keep its
calendar. A removed farm that has the page open is signed out with a message.

The farm's sign-in stays in Firebase Authentication, so the same email can
register again later. To free the email completely, also delete it under
**Authentication → Users**. Administrators are not removed from the app; delete
an administrator's document in **Firestore → `calendarOperators`** and its user
under **Authentication → Users** in the console.

### Days and Weeks
The calendar opens in **Days**: every planting drawn at its dates, from land
preparation to its last harvest, with its dates written under it. The days on
screen fit every planting from its first day to its last — across the turn of
a year when a season runs on — so nothing has to be paged through (**1 year**,
**6 months** and **3 months** zoom in when wanted). A planting planned from the
crop guide is drawn to the day; one coloured by hand is drawn by its weeks.
**Weeks** is the TIPFA template's grid, where weeks are coloured by hand; it is
also what is stored, exported to Excel and added up. It too opens on the
**Whole season**: from the first coloured week of any planting to its last
harvest, across the years, with nothing to page through (**3 years**, **1 year**,
**6 months** and **3 months** show a window of the three years instead, to page
through with the arrows).

Under the calendar, in both views, **Harvest by crop** gives each crop's
kilograms month by month, on its own row with what it gives over the months
shown. Crops are never added to one another, since kilograms of tomatoes and
of melons are not one figure. A crop planted in more than one variety has a row
for each variety under it; one planted in a single variety names it. The Excel
export keeps the template's TOTAL HARVEST row as it is.

### The crop guide
Under **Crop guide**, administrators see every crop's figures and a calculator:
pick a crop, the number of seedlings and a sowing date, and it shows what a
plant gives, the total, each harvest week, and the working (e.g. 0.3 kg a week ×
14 weeks = 4.2 kg a plant × 1,000 seedlings = 4,200 kg) with the dates.
**Edit** changes a crop as its stages, in days — sowing to transplanting,
transplanting to flowering (vegetative growth), flowering / fruit set to the
first harvest — then how it is picked, how many weeks the harvest lasts and
the total kg a plant gives; the weekly kilograms are worked out from those.
**Add a crop** adds a new one,
**Reset** puts a built-in crop back to the TIPFA figures, and **Delete** removes
an added crop. The guide is kept in `calendarSettings/cropGuide` and every farm
plans with it at once. Plantings already on a calendar follow the change by
themselves — the same dates, plants, variety and the farm's own timings, with
the new days and kilograms — as soon as the farm's calendar is open (the
Secretariat's view shows the new figures straight away). A planting whose
weeks the farm has changed by hand is left alone: it shows an orange update
button beside it, and the farm decides whether to plan it again. This needs the
`calendarSettings/cropGuide` block of `firestore.rules` published.

### Where the built-in figures come from
The built-in crop guide is the **Rijk Zwaan crop guide "Growth stages and
harvest per plant"** (Sub-Saharan Africa range, October 2026). For every
variety it gives the days after sowing to transplanting, flowering, fruit set
and first harvest, how long the harvest lasts, the fruit weight and an
estimated harvest a plant. Crops: tomato (7 varieties), cherry tomato (3),
habanero pepper (4), hot pepper (3), capsicum (5), sweet melon (8),
cauliflower (2) and broccoli (2), plus the guide's general guidance for onion,
basil, coriander, parsley and avocado (Rijk Zwaan does not sell those).

In the app, each crop's own figures are its first variety's, and each variety
carries its own days and harvest. The middle of each range is used. As stages:
nursery = sowing to transplanting; vegetative growth = transplanting to
flowering (or curd, head or bulb initiation); flowering = from there to the
first harvest. ★ in a variety's note marks Rijk Zwaan's own figure. The
harvest a plant is the guide's estimate (a typical number of fruits × Rijk
Zwaan's fruit weight): farms should check it against their own records.
Capsicum yields are the greenhouse figures; avocado is planned for a tree in
full bearing (100 kg over a 24-week season, which the guide does not give).

This edition replaces the whole built-in guide when it loads: every built-in
crop takes the new figures — including any the Secretariat had changed
before — and crops removed before come back. Crops the Secretariat added
itself are kept. Mint and rosemary, which the guide does not cover, are gone.

### Removing a crop from the guide
Under **Crop guide**, every crop has **Remove**. Farms can then no longer plant
it; plantings of it already on calendars stay, marked "not in the crop guide".
A built-in crop removed this way is listed under **Removed crops** with **Put
back**, and is not brought back by a later edition of the built-in guide (the
saved guide keeps a short `{id, removed: true}` marker for it). A crop the
Secretariat added itself is gone for good once removed.

### Pictures
Each built-in crop has a picture: a single crop cut out with no background,
in `public/assets/crops/<crop id>.webp` (192 px, about 11 KB each; made with
Higgsfield; basil's file is `herbs.webp`). They appear beside the crop on the calendar, in the planting
editor, in the crop guide and calculator, and in the totals. Under
**Crop guide → Edit**, the Secretariat can upload a crop's own picture (best
as a cut-out PNG or WebP) or go back to the built-in one; an uploaded picture
is made small in the browser and kept in the crop guide.

Each **variety** has its own colour (the colour of its fruit, curd or rind)
and its own picture. A built-in variety's picture is
`public/assets/varieties/<name>.webp` (the name without "RZ F1", in lower
case with hyphens, e.g. `red-jet.webp`), listed in `VARIETY_PICS` in the app;
a variety without one shows its crop's picture. A planting's badge on the
calendar shows its variety's picture, ringed in the variety's colour, and a
dot of that colour sits beside the variety's name. Under **Crop guide → Edit**,
each variety has a picture to upload (made 128 px in the browser) and a
colour to pick. The crop guide is one database document of at most 1 MB, so
the app refuses a save that would pass about 950 KB of uploaded pictures.

Farms and administrators add a **profile photo** by clicking their name at the
top (on a phone, in the menu). It is cropped to a 192 px square in the browser
and saved on the account (`photo`, a data URL of at most 120,000 characters,
which the rules check). It shows wherever the initials were. Saving a photo
needs the current `firestore.rules`; a calendar saves separately, so it is not
affected if the rules are older.

### Varieties
In the planting editor a farm picks its variety from the crop's list (with
what the seed company says of it, and the guide's figures for it) or types another. A
variety with its own days is planned with them. The variety shows on the
calendar and goes to Excel in the notes column (`Variety: …`), and comes back
from it on import. The Secretariat edits each crop's varieties under
**Crop guide → Edit**.

### A farm planning its own way
In the planting editor, a farm can open **Change the timings for this
planting** and give its own days for each stage, harvest weeks and kg a plant
— for that planting only. Or it can choose **Colour the weeks yourself**, which
switches the automatic plan off for that planting: its dates and plants are
kept and the weeks are coloured by hand (pick a stage and click or drag across
the weeks, or use Fill weeks). Any week of any planting can always be changed
by hand.

### Archive
A planting whose season is over shows a box button beside it (and **Archive** in
its editor). Archiving takes it off the calendar, its totals and the Excel
export, and keeps it under the farm's **Archive** page with its dates, plants
and harvest, where it can be restored or deleted. Administrators see a farm's
archived plantings, read only, under its calendar.

### Backups
Under **Crop calendars**, **Export every farm (Excel)** downloads one workbook: the
association's totals, then every farm's calendar. Doing this regularly (e.g.
monthly) is the simplest backup. Firestore's own scheduled exports need the Blaze plan.

### Several accounts in one browser
Farms and administrators sign in through separate Firebase app instances
(`tipfa-crop-calendar` and `tipfa-crop-calendar-admin`), and each tab remembers
which account it shows (sessionStorage), with the device remembering the last
one for new tabs (localStorage). So an administrator in one tab and a farm in
another both stay signed in, and refreshing a tab keeps its own account.

### Password resets
**Forgotten your password?** on the sign-in screen sends Firebase's reset email. The
sender name and wording can be changed under **Authentication → Templates**.

## Updating the site later

1. Edit `public/index.html`.
2. Raise the build number near the top of it, e.g.
   `<meta name="tipfa-build" content="v2">`. Phones keep pages for a long time;
   the page compares its own number with the server's and asks the user to reload
   when it is behind.
3. `firebase deploy --only hosting`.

### Changing the crop guide's figures

Administrators change them in the app, under **Crop guide** (see above). The
built-in figures — used until someone edits the guide, and what **Reset** puts
back — are the `CROP_GUIDE_DEFAULT` list in `public/index.html`. For each crop:

| Field | Meaning | Source |
|---|---|---|
| `nursery: [6, 8]` | weeks from sowing to transplant size (`nurseryDays: [180, 210]` gives it in days) | sowing table, avocado sprouting timeline |
| `flowerDays: 14` | days of flowering / fruit set before the first harvest (written by the in-app editor; `flower` gives it in weeks) | the Secretariat |
| `fromSowing: [85, 100]` | days from sowing to the first harvest | sowing table |
| `fromTransplant: 70` | days from transplanting to the first harvest, for crops not in the sowing table | Harvest Ledger week |
| `flower: 3` | weeks of flowering / fruit set before the first harvest | standard |
| `harvest` | `weekly` (`weeks`, `kg`), `pulses` (`count`, `every`, `kg`), `head` (`kg`, `sideWeeks`, `sideKg`), `single`, or `picking` (`seasonKg`, cut weekly to 24 weeks after transplanting), or `none` (grows on to the end of the calendar, as avocado from seed) | Harvest Ledger, Yield Calculator |

Ranges use their middle. `kg: null` means the guide has no yield for that crop,
and the farm is asked for its own expected kg a plant. Changing a figure affects
plantings planned from then on, not ones already on a calendar. Once an
administrator has saved the guide in the app, the database copy is used instead
of the built-in list.

`firebase.json` serves `index.html` and `firebase-config.js` with `no-cache`, so
browsers always check for a newer copy. Logos and the Excel library are cached
for a week and 30 days respectively. If you replace the Excel library, give it a
new file name.

## Hosting on Netlify from the repository

`netlify.toml` in this folder sets Netlify up the same way as Firebase Hosting.
In Netlify: **Site configuration → Build & deploy → Link repository** → GitHub →
this repository and branch, with **Base directory** `tipfa-system/crop-calendar`,
**Build command** empty and **Publish directory** `tipfa-system/crop-calendar/public`.
Every push to that branch then goes live by itself. Add the Netlify address under
**Authentication → Settings → Authorized domains** in Firebase.

## As the TIPFA website's Members Portal

The TIPFA website (the repository's root `index.html`) has a **Members Portal**
page, `members-portal/`. It is a page of the website: the website's own header,
and this system filling the screen below it.

- `members-portal/index.html` is the page. Its header is taken from the
  website's `index.html`, so it always matches it.
- `members-portal/app/` is a copy of this system, shown inside the page.

The website links to the page from its header, the phone menu, the Membership
section and the footer. Inside the page the system leaves the brand to the
website's header; opened on its own at `members-portal/app/`, it calls itself
"Members Portal" and leads back to the website. It uses the same Firebase
project, so every account and calendar is the same as on the crop calendar's
own address.

**Dark mode.** The moon button in the page's header (beside the Members Portal
button; on phones, beside the menu) turns the page and the system dark, and the
sun button turns them light again. The choice is remembered on each device
(`localStorage` "tipfa-theme"), and the system opened on its own follows it too.
The system's dark colours are written from its light ones at every build, so a
new screen is dark without extra work; a few are set by hand.

After changing the system, or the website's header, rebuild the page
from the project root:

    bash scripts/build-members-portal.sh

Add the website's domain under **Authentication → Settings → Authorized
domains** in Firebase, as for any other address the system is served from.

## Hosting somewhere else

Any static host works (cPanel, Netlify, Cloudflare Pages, an S3 bucket…):

1. Upload the **contents** of `public/` to the site root.
2. Serve `index.html` and `firebase-config.js` with `Cache-Control: no-cache`.
3. The database still needs the rules: from this folder run
   `firebase deploy --only firestore` once (after steps 1–2 and the `.firebaserc`
   change), or paste `firestore.rules` into **Firestore → Rules → Publish**.
4. Add the domain under **Authentication → Settings → Authorized domains**.

## Troubleshooting

| What you see | Why, and what to do |
|---|---|
| Sign-in screen says "No shared database is set up" | `public/firebase-config.js` is still `null`, or the browser has an old copy. Fill it in, redeploy, reload. |
| "The crop calendar cannot be reached" | The page could not load Firebase: the device is offline, or something blocks `www.gstatic.com` / `*.googleapis.com`. Try again on another network. |
| Registering says "the system refused that" | The code typed does not match `calendarSettings/signup`; check capitals and spaces. If no code works, the document is missing (step 4), or the rules were not deployed (step 3). |
| A new administrator is stuck waiting | Someone already owns the system; an approved administrator must approve them. If nobody can, fix ownership in the console (step 6). |
| A farm says its change was not saved | The farm was suspended while it had the page open. Reinstate it under Members & approvals. |
| Password reset emails don't arrive | Check spam. Check the domain is under Authorized domains (step 5). |
| Saving the crop guide says the rules do not allow it | The published rules predate the crop guide. Publish the current `firestore.rules`. |
| The site still looks old after a push | The version badge at the top right shows which build is open. If it is behind the `tipfa-build` number in `public/index.html`, the host has not deployed the latest commit — check Netlify's Deploys list — or the browser holds an old copy: reload. |

## The data, for reference

| Collection | Holds | Who can read | Who can write |
|---|---|---|---|
| `calendarSettings/signup` | the two sign-up codes | nobody | console only |
| `calendarSettings/owner` | the system owner's UID | anyone signed in | the first administrator, once |
| `calendarSettings/cropGuide` | the crop guide, as administrators last saved it | anyone signed in | approved administrators |
| `calendarOperators/{uid}` | an administrator: name, email, status | themselves, approved administrators | themselves on registering; approved administrators change status |
| `calendarFarms/{uid}` | a farm: details, status, units and blocks, plantings and their weeks | the farm, approved administrators | the farm (calendar, only while approved); approved administrators change status or remove the farm |

A farm's whole calendar is one document. Each week is stored compactly, `"T"` for a
transplanting week or `"H:120"` for a harvest week of 120 kg. An archived planting stays
in the same list with an `archived` date. The rules cap a farm
at 1,000 plantings, which keeps a document well below Firestore's 1 MiB limit.
