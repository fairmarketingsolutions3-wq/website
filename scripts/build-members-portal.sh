#!/usr/bin/env bash
# Build the website's Members Portal page (members-portal/).
#
#   members-portal/index.html  the page: the website's own header (taken from
#                              index.html) above the system, which fills the screen
#   members-portal/app/        the TIPFA crop calendar system itself
#
# The system is built in tipfa-system/crop-calendar/public. Run this from the
# project root after changing it, or after changing the website's header:
#   bash scripts/build-members-portal.sh
#
# The portal uses the same Firebase project and accounts as the crop calendar.

set -euo pipefail

SRC="tipfa-system/crop-calendar/public"
OUT="members-portal"

[ -f "$SRC/index.html" ] || { echo "Run this from the project root: $SRC/index.html not found." >&2; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT/app"
cp -R "$SRC/index.html" "$SRC/firebase-config.js" "$SRC/assets" "$SRC/vendor" "$OUT/app/"
python3 scripts/members-portal-page.py

echo "Members Portal updated from $SRC ($(grep -o 'tipfa-build" content="[^"]*' "$OUT/app/index.html" | cut -d'"' -f3))."
