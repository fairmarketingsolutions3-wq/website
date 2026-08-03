#!/usr/bin/env bash
# Download the generated visuals into assets/img and point index.html at the
# local copies, so the site no longer depends on the generator CDN.
#
# Run once from the project root:
#   bash scripts/localize-assets.sh
#
# Requires: curl. Optional: cwebp or ImageMagick if you want to convert to jpg.

set -euo pipefail

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3CLEtLPeh0N3uP7Q35ulf9rxYre"
OUT="assets/img"
VID="assets/video"

mkdir -p "$OUT" "$VID"

# local-name<TAB>remote-file
ASSETS=$(cat <<'EOF'
gen-screenhouse-capsicum.webp	hf_20260803_090844_a555282e-d4b1-494c-8b24-396b7b88d55d_min.webp
gen-crop-records.webp	hf_20260803_093516_a90c6f8e-2c12-469c-9c68-449b8ca947d9_min.webp
gen-nursery-seedlings.webp	hf_20260803_093519_0e379675-2368-40c7-8c65-d3c5ed57979d_min.webp
gen-graded-crates.webp	hf_20260803_093532_f972932b-e1d8-4c90-834f-8d0134cf62f4_min.webp
gen-drip-irrigation.webp	hf_20260803_093813_e0add536-648e-4f13-b865-c67015317362_min.webp
gen-greenhouses-golden-hour.webp	hf_20260803_093820_169b601e-74cd-46b1-9c3c-f52fbb398415_min.webp
gen-brassicas-highland.webp	hf_20260803_093832_3b7a371c-4cba-4bf7-a90d-a0388d26f410_min.webp
gen-tomato-screenhouse.webp	hf_20260803_093835_eecdfb9e-2961-4d51-8cba-da876c79fa06_min.webp
gen-crop-capsicum.webp	hf_20260803_112424_24d21593-7bad-4333-b8d0-821f30140057_min.webp
gen-crop-habanero.webp	hf_20260803_112447_7edb06d5-7f5c-46a6-98cc-dbcffba4e374_min.webp
gen-crop-cherry-tomato.webp	hf_20260803_112457_5aba4b63-aab3-4cfe-8c7e-458fe7c2d2f1_min.webp
gen-crop-cucumber.webp	hf_20260803_112634_8d33aa91-dc76-4d91-8fe7-061ad471c76d_min.webp
gen-crop-avocado.webp	hf_20260803_112651_04f33920-47ca-4444-8620-c9e4ca12a324_min.webp
gen-crop-broccoli.webp	hf_20260803_112749_d06ad29e-d1a2-4900-b68d-9eafac96566f_min.webp
gen-crop-cauliflower.webp	hf_20260803_112759_ae3219ec-ba77-41f6-b388-31ca3cb1ab45_min.webp
gen-crop-herbs.webp	hf_20260803_112812_56f5abc1-2625-4df0-a78b-20075e874612_min.webp
gen-market-dar-es-salaam.webp	hf_20260803_120126_44a93caa-e672-41d0-8f7c-cd4714b1e075_min.webp
gen-market-dodoma.webp	hf_20260803_120139_3a2b29b3-3b5a-40c1-8996-00433060680b_min.webp
gen-market-zanzibar.webp	hf_20260803_120149_741da356-e353-4ac3-93af-bf9ce5d6eb0a_min.webp
gen-market-arusha.webp	hf_20260803_121142_8e89127c-cb61-447e-aed1-390f19b2e1ea_min.webp
EOF
)

echo "Downloading images..."
while IFS=$'\t' read -r local remote; do
  [ -z "$local" ] && continue
  echo "  $local"
  curl -fsSL -o "$OUT/$local" "$BASE/$remote"
  # rewrite every reference to this remote file
  sed -i.bak "s#$BASE/$remote#$OUT/$local#g" index.html
done <<< "$ASSETS"

echo "Downloading hero film..."
HERO="hf_20260803_091150_e6271763-3798-4b43-9f95-d6d2f014455e.mp4"
curl -fsSL -o "$VID/hero-film.mp4" "$BASE/$HERO"
sed -i.bak "s#$BASE/$HERO#$VID/hero-film.mp4#g" index.html

rm -f index.html.bak
echo
echo "Done. All visuals are now local. Commit the assets folder and index.html."
