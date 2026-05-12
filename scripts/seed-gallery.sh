#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:4000/api}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-changeme123}"

TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

[ -z "$TOKEN" ] && { echo "login failed"; exit 1; }
echo "got token"

API_URL="$API_URL" TOKEN="$TOKEN" python3 <<'PY'
import json, os, urllib.request

api_url = os.environ["API_URL"]
token = os.environ["TOKEN"]

GALLERIES = {
  "punjab-government-announces-new-industrial-policy": [
    "https://images.unsplash.com/photo-1601042879364-f3947d3f9b1f?w=1200&q=70",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=70",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=70",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=70",
  ],
  "shubman-gill-stars-as-india-seal-series-win-in-style": [
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=70",
    "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1200&q=70",
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=70",
    "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&q=70",
  ],
  "sensex-surges-600-points-as-markets-rally-for-fifth-day": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=70",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=70",
    "https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=1200&q=70",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=70",
  ],
  "summer-health-alert-tips-to-stay-safe-in-rising-heat": [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=70",
    "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=70",
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=70",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=70",
  ],
  "tata-launches-new-suv-safari-adventure": [
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=70",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=70",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=70",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=70",
  ],
  "ludhiana-police-bust-gang-involved-in-car-theft-racket": [
    "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=1200&q=70",
    "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200&q=70",
    "https://images.unsplash.com/photo-1564540583246-934409427776?w=1200&q=70",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&q=70",
  ],
  "kartik-aaryans-aashiqui-3-release-date-announced": [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=70",
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&q=70",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&q=70",
    "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=1200&q=70",
  ],
  "imd-issues-thunderstorm-and-rain-alert-in-north-india": [
    "https://images.unsplash.com/photo-1561211974-d048d24eaa3a?w=1200&q=70",
    "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1200&q=70",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=70",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=70",
  ],
}

def get(url):
  req = urllib.request.Request(url, headers={"Accept": "application/json"})
  with urllib.request.urlopen(req) as r:
    return json.loads(r.read().decode())

def post_image(article_id, url, alt):
  body = json.dumps({"url": url, "alt": alt}).encode()
  req = urllib.request.Request(
    f"{api_url}/articles/{article_id}/images/url",
    data=body,
    headers={
      "Authorization": f"Bearer {token}",
      "Content-Type": "application/json",
    },
    method="POST",
  )
  urllib.request.urlopen(req).read()

for slug, urls in GALLERIES.items():
  try:
    article = get(f"{api_url}/articles/slug/{slug}")
  except Exception as e:
    print(f"  skip {slug}: {e}")
    continue
  aid = article["id"]
  existing = len(article.get("images") or [])
  if existing:
    print(f"  {slug}: already has {existing}, skip")
    continue
  for i, url in enumerate(urls):
    try:
      post_image(aid, url, f"Photo {i+1}")
    except Exception as e:
      print(f"  fail {slug} #{i}: {e}")
  print(f"  {slug}: +{len(urls)}")
PY
echo done
