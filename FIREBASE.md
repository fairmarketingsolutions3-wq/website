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

## Making the first operator

Security rules deliberately refuse to let anyone grant themselves operator
status, so the first one is created by hand, once:

1. Sign up in the platform as an operator using the operator code. This creates
   your Firebase Authentication user.
2. In the console, **Build → Authentication → Users**, copy your **User UID**.
3. **Build → Firestore Database → Data → Start collection** → collection id
   `operators` → document id: paste your UID → add a field `name` (string) with
   your name → **Save**.

From then on operators add each other from inside the platform.

## The data

| Collection | Holds | Who can read | Who can write |
|---|---|---|---|
| `settings/signup` | the two sign-up codes | nobody | operators |
| `operators/{uid}` | one document per operator | operators | the operator, or another operator |
| `farms/{uid}` | profile, crops, crop calendar, prices, archives | that farm, and operators | that farm, and operators |
| `harvest/{uid}` | that farm's harvest figures | that farm, and operators | that farm, and operators |
| `submissions/{id}` | requests and complaints | the farm that raised it, and operators | the farm creates; operators resolve |

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
