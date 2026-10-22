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
  administrators, under **Members & approvals**. Every decision is recorded with
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
The app deliberately cannot delete anything. Suspending keeps a farm out and keeps
its calendar. To remove an account completely, in the console:

1. **Firestore → `calendarFarms`** (or `calendarOperators`) → the document named by
   the user's UID → delete it.
2. **Authentication → Users** → the same user → delete.

### Backups
Under **Crop calendars**, **Export every farm (Excel)** downloads one workbook: the
association's totals, then every farm's calendar. Doing this regularly (e.g.
monthly) is the simplest backup. Firestore's own scheduled exports need the Blaze plan.

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

The per-plant figures behind **planned from the sowing date** are the `CROP_GUIDE`
list in `public/index.html` (search for `const CROP_GUIDE`). For each crop:
`nursery` (weeks from sowing to transplanting, used when no transplanting date is
given), `flower` (weeks of flowering before the first harvest), `first` (the
harvest week, counted from transplanting as in the Harvest Ledger), and the
kilograms a plant gives (`kg`, and for broccoli `sideKg`; sweet melon picks every
`every` weeks). Changing a figure affects plantings planned from then on, not
ones already on a calendar. Raise the build number after editing.

`firebase.json` serves `index.html` and `firebase-config.js` with `no-cache`, so
browsers always check for a newer copy. Logos and the Excel library are cached
for a week and 30 days respectively. If you replace the Excel library, give it a
new file name.

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

## The data, for reference

| Collection | Holds | Who can read | Who can write |
|---|---|---|---|
| `calendarSettings/signup` | the two sign-up codes | nobody | console only |
| `calendarSettings/owner` | the system owner's UID | anyone signed in | the first administrator, once |
| `calendarOperators/{uid}` | an administrator: name, email, status | themselves, approved administrators | themselves on registering; approved administrators change status |
| `calendarFarms/{uid}` | a farm: details, status, units and blocks, plantings and their weeks | the farm, approved administrators | the farm (calendar, only while approved); approved administrators change status |

A farm's whole calendar is one document. Each week is stored compactly, `"T"` for a
transplanting week or `"H:120"` for a harvest week of 120 kg. The rules cap a farm
at 1,000 plantings, which keeps a document well below Firestore's 1 MiB limit.
