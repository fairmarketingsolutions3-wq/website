#!/usr/bin/env bash
# Copy the TIPFA crop calendar system into the website as its Members Portal
# page (members-portal/), so it opens at <website>/members-portal/.
#
# The system itself is built in tipfa-system/crop-calendar/public. Run this
# from the project root after every change to it:
#   bash scripts/build-members-portal.sh
#
# The portal uses the same Firebase project and accounts as the crop calendar.
# When opened under members-portal/ it names itself "Members Portal" and its
# logo leads back to the website.

set -euo pipefail

SRC="tipfa-system/crop-calendar/public"
OUT="members-portal"

[ -f "$SRC/index.html" ] || { echo "Run this from the project root: $SRC/index.html not found." >&2; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$SRC/index.html" "$SRC/firebase-config.js" "$SRC/assets" "$SRC/vendor" "$OUT/"

echo "Members Portal updated from $SRC ($(grep -o 'tipfa-build" content="[^"]*' "$OUT/index.html" | cut -d'"' -f3))."
