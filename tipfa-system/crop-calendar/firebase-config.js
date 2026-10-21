/* TIPFA Crop Calendar — Firebase project settings.
 *
 * Left empty on purpose. With nothing here the crop calendar runs entirely in
 * the browser, exactly as the platform does when it has no database: each
 * device keeps its own farms, and calendars travel between devices as Excel.
 *
 * To share calendars between devices and with the Secretariat, paste a
 * Firebase web app's config here — see FIREBASE.md first. Use a project of its
 * own, or read FIREBASE.md before pointing it at the platform's tipfa-28e23:
 * publishing this copy's rules there would replace the platform's rules.
 *
 * Like the platform's config, these values identify a project and authorise
 * nothing. Never put a service account key in this repository.
 */
window.TIPFA_CC_FIREBASE_CONFIG = null;

/* Example, once a project exists:
window.TIPFA_CC_FIREBASE_CONFIG = {
  apiKey: "…",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "…",
  appId: "…"
};
*/
