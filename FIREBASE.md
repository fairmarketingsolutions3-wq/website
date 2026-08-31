# Connecting the platform to Firebase

The platform runs from browser storage on its own. Firebase is what makes a
farm registered on one phone appear in the Secretariat's console on another,
and what replaces browser-held passwords with properly hashed ones.

Project: **tipfa-28e23**

## What has to be switched on

In the [Firebase console](https://console.firebase.google.com):

1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
2. **Build → Firestore Database → Create database → Start in production mode**,
   then choose a location. The location is permanent; `europe-west1` or
   `asia-south1` are the sensible choices from Tanzania.
3. **Build → Firestore Database → Rules** → replace everything with
   [`firestore.rules`](firestore.rules) → **Publish**.

Stay on the free **Spark** plan. It allows 50,000 reads and 20,000 writes a
day, far beyond what an association of this size will use, and needs no card.

## Creating the sign-up codes document

The rules check every registration against a codes document that no browser can
read. It has to exist before anyone can register, and it is created by hand
once, in the console:

1. **Build → Firestore Database → Data → Start collection**
2. Collection ID: `settings` → **Next**
3. Document ID: `signup` (type it — do not use the auto-ID button)
4. Add two fields, both of type **string**:
   - `farmCode` — the code you give to farms
   - `operatorCode` — the code you give to Secretariat staff
5. **Save**

Choose your own values. Anyone holding a code can create that kind of account,
so keep the two different and treat the operator one as a staff password.

No client can read this document — only the security rules can, which is how a
code is checked without ever being sent to a browser.

## Operators

Operators register themselves from the platform's Administrator tab using the
operator code. The rules allow it only when the code matches and only against
the operator's own user id, so operator status still cannot be self-granted
without the code. No manual step is needed.

## Roles

Every account also has a record in `users/{uid}` saying what it may do. It is
written by the platform at sign-up; nothing has to be created by hand.

| Role | What it is for |
|---|---|
| `superAdmin` | the system owner — the only account that may change anyone's role |
| `secretariat` | the association's staff: members, codes, catalogue, orders, reports |
| `qualityOfficer` | harvest batches and complaints |
| `agronomist` | advisory work and the knowledge library |
| `farmMember` | one farm, its own records only |
| `logistics` | consignments |
| `auditor` | reads everything, writes nothing |
| `customer` | their own orders, and public traceability |

**The system owner is the first operator to arrive.** Rules cannot count a
collection, so being first is not something the platform can prove by looking:
it is claimed instead. The first operator to sign up — or, on an association
already running, the first existing operator to sign in after this version is
deployed — writes their user id into `settings/ownership`. Because a create
rule applies only to a document that does not yet exist, every later claim is
refused. Nobody can take ownership afterwards, and nobody can grant it to
themselves.

Everyone else who registers with the operator code is `secretariat`. The system
owner changes that on the **Governance** tab: each account on the roll has a
role control and a **Suspend** button. Both are refused by the database for
anyone else, so hiding the control is a courtesy, not the protection.

If you need to move ownership to a different account, edit the `owner` field of
`settings/ownership` in the console and set that account's `role` in
`users/{uid}` to `superAdmin`.

## The data

| Collection | Holds | Who can read | Who can write |
|---|---|---|---|
| `settings/signup` | the two sign-up codes | nobody | operators |
| `operators/{uid}` | one document per operator | operators | the operator, or another operator |
| `farms/{uid}` | profile, crops, crop calendar, prices, archives | that farm, and operators | that farm, and operators |
| `harvest/{uid}` | that farm's harvest figures | that farm, and operators | that farm, and operators |
| `submissions/{id}` | requests and complaints | the farm that raised it, and operators | the farm creates; operators resolve |
| `users/{uid}` | role, farms held, active or suspended | that person, and staff | that person may correct their name and phone; only the system owner may change a role, a farm list or a status |
| `settings/ownership` | which account owns the settings | anyone signed in | written once, by the first operator; only the owner after that |

Harvest is kept apart from the farm document because a season of weekly entries
grows steadily, and a Firestore document is capped at 1 MiB.

The sign-up codes are never sent to a browser. Security rules can read
documents a client cannot, so a code is *checked* against the stored value
without ever being *revealed* to the page — which is what the current
browser-only version cannot do.

## The config file

`firebase-config.js` holds the project's public web configuration. Those values
identify the project; they do not authorise anything, which is why Firebase
ships them in public HTML. The rules above are what protects the data.

**Never** add a service account key (Project settings → Service accounts →
Generate new private key) to this repository. That file is a real secret. It is
not needed here.
