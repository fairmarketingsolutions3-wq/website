# Connecting the crop calendar to Firebase

The crop calendar runs from browser storage on its own, exactly as the full
platform does. Out of the box `firebase-config.js` is empty, so:

- each device keeps its own farms and calendars,
- an administrator on a device sees the farms registered on that device,
- calendars travel between devices as Excel — **Export to Excel** on a farm,
  **Import from Excel** on another, in the master template's own layout.

Firebase is what lets a farm register on one phone and appear on the
Secretariat's screen on another. Setting it up is optional.

## Two ways to set it up

### A. A project of its own (recommended)

Nothing about the full platform is touched.

1. [Firebase console](https://console.firebase.google.com) → **Add project**.
   Stay on the free **Spark** plan.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database → Start in production mode**,
   then choose a location (`europe-west1` or `asia-south1` from Tanzania). The
   location is permanent.
4. **Build → Firestore Database → Rules** → replace everything with
   [`firestore.rules`](firestore.rules) from this folder → **Publish**.
5. Create the sign-up codes document (below).
6. **Project settings → Your apps → Web app (`</>`)** → register an app and copy
   its `firebaseConfig` into [`firebase-config.js`](firebase-config.js), as the
   value of `window.TIPFA_CC_FIREBASE_CONFIG`.

### B. The same project as the platform (`tipfa-28e23`)

Useful if farms should sign in with the same email and password they use on
the platform. The calendar keeps to its own collections — `calendarFarms`,
`calendarOperators`, `calendarSettings` — and never reads or writes the
platform's `farms`, so the two cannot overwrite each other's records.

> **Do not publish this folder's `firestore.rules` on `tipfa-28e23`.**
> A Firestore database has one set of rules. Publishing this file would
> replace the platform's rules and lock the platform out of its own data.

Instead:

1. Open the platform's `firestore.rules`.
2. From this folder's `firestore.rules`, copy the section between
   `From here to the end marker` and `End of the blocks to paste`.
3. Paste it into the platform's file just above its final
   `match /{document=**}` block. The platform already defines `signedIn()`
   identically, so it is left out of the section; nothing else in it clashes
   with a name the platform uses.
4. Publish the combined file.
5. Create the sign-up codes document (below).
6. Copy the values from the platform's `firebase-config.js` into this folder's
   `firebase-config.js`, as `window.TIPFA_CC_FIREBASE_CONFIG`.

A farm that already has a platform account registers for the calendar with the
same email **and the same password**; the calendar is added to that account
rather than the address being reported as taken. A wrong password or a wrong
sign-up code is refused and the platform account is left exactly as it was —
it is never deleted.

## Creating the sign-up codes document

The rules check every registration against a codes document that no browser can
read. It must exist before anyone can register:

1. **Build → Firestore Database → Data → Start collection**
2. Collection ID: `calendarSettings` → **Next**
3. Document ID: `signup` (type it — do not use the auto-ID button)
4. Add two fields, both of type **string**:
   - `farmCode` — the code you give to farms
   - `operatorCode` — the code you give to Secretariat staff
5. **Save**

These are separate from the platform's `settings/signup` codes, so the two can
be the same or different as the Secretariat prefers. Anyone holding a code can
create that kind of account, so keep the two different and treat the operator
one as a staff password.

## The data

| Collection | Holds | Who can read | Who can write |
|---|---|---|---|
| `calendarSettings/signup` | the two sign-up codes | nobody | nobody (console only) |
| `calendarOperators/{uid}` | one document per Secretariat operator | that operator, and other operators | created by the operator with the operator code |
| `calendarFarms/{uid}` | the farm's details, how it is divided, and its calendar | that farm, and operators | that farm only — created with the farm code |

Operators read every farm's calendar and change none of it; the calendar is the
farm's own record. A farm document holds the whole calendar: its growing units
and blocks, and each planting with its weeks stored compactly (`"T"` for a
transplanting week, `"H:120"` for a harvest week of 120 kg). A farm with a
thousand plantings stays far below Firestore's 1 MiB document limit, and the
rules cap a calendar at a thousand plantings.

## What was tested

The rules and the sign-in flows were run against the Firebase emulator before
this was committed, through the page itself:

- a farm's wrong code is refused and leaves no account behind; the right code
  registers it, its edits reach the database, and a reload signs it back in
  with its calendar pulled from the database;
- an operator cannot register with the farm code, and with its own code sees
  every farm's calendar, read only;
- with real sign-in tokens, a farm cannot read or write another farm, an
  operator cannot edit a farm, nobody can read the codes, a farm cannot add
  fields or put a code back, nothing can be deleted, and neither role can reach
  the platform's `farms` collection;
- on a shared project, a farm's existing platform account is adopted with its
  own password and its platform record is left untouched.

## The config file

`firebase-config.js` holds a project's public web configuration. Those values
identify the project; they do not authorise anything — the rules above are what
protect the data.

**Never** add a service account key (Project settings → Service accounts →
Generate new private key) to this repository. That file is a real secret and is
not needed here.
