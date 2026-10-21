/* TIPFA Crop Calendar — Firebase project settings.
 *
 * Fill this in before the site goes live. DEPLOY.md, step 2, says where each
 * value comes from (Firebase console → Project settings → Your apps → Web app).
 *
 * With this left empty the page still opens, but as a demonstration: every
 * device keeps its own accounts and calendars, and an administrator on one
 * phone never sees a farm that registered on another. Approving members only
 * works properly once this is filled in.
 *
 * These values identify the project; they are not secrets, and every Firebase
 * web app ships them in public files. What protects the data is
 * firestore.rules, deployed beside this folder. Never put a service account
 * key (Project settings → Service accounts → Generate new private key) here or
 * anywhere in the site.
 */
window.TIPFA_CC_FIREBASE_CONFIG = null;

/* Once the project exists it looks like this:
window.TIPFA_CC_FIREBASE_CONFIG = {
  apiKey: "AIza…",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "…",
  appId: "1:…:web:…"
};
*/
