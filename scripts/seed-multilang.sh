#!/usr/bin/env bash
# Seeds sample articles in English with Hindi + Punjabi translations.
# Usage: ./scripts/seed-multilang.sh
# Env: API_URL (default http://localhost:4000/api), ADMIN_USER, ADMIN_PASS

set -euo pipefail

API_URL="${API_URL:-http://localhost:4000/api}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-changeme123}"

echo ">> Logging in as $ADMIN_USER"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

if [ -z "$TOKEN" ]; then
  echo "Login failed"; exit 1
fi
echo ">> Got token"

echo ">> Fetching taxonomy"
CATS=$(curl -s "$API_URL/categories")
LOCS=$(curl -s "$API_URL/locations")

cat_id() {
  echo "$CATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(next(c['id'] for c in d if c['slug']=='$1'))"
}
loc_id() {
  echo "$LOCS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(next(l['id'] for l in d if l['slug']=='$1'))"
}

create_article() {
  local title="$1"; local desc="$2"; local content="$3"
  local img="$4"; local author="$5"; local cat_slug="$6"; local loc_slug="$7"
  local cid; cid=$(cat_id "$cat_slug")
  local lid; lid=$(loc_id "$loc_slug")

  curl -s -X POST "$API_URL/articles" \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=$title" \
    -F "description=$desc" \
    -F "content=$content" \
    -F "image_url=$img" \
    -F "author=$author" \
    -F "published=true" \
    -F "category_ids=$cid" \
    -F "location_ids=$lid" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])'
}

add_translation() {
  local article_id="$1"; local lang="$2"; local title="$3"; local desc="$4"; local content="$5"
  curl -s -X POST "$API_URL/articles/$article_id/translations" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$(python3 -c "
import json, sys
print(json.dumps({
  'language': '$lang',
  'title': '''$title''',
  'description': '''$desc''',
  'content': '''$content'''
}))")" > /dev/null
}

IMG_PUNJAB="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=70"
IMG_CRICKET="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=70"
IMG_MARKET="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=70"
IMG_HEALTH="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=70"
IMG_AUTO="https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&auto=format&fit=crop&q=70"
IMG_HEAT="https://images.unsplash.com/photo-1561211974-d048d24eaa3a?w=1200&auto=format&fit=crop&q=70"
IMG_POLITICS="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=70"
IMG_ENT="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=70"

# 1. Punjab Government - Politics
echo ">> Creating: Punjab Government Announces New Industrial Policy"
A1=$(create_article \
  "Punjab Government Announces New Industrial Policy" \
  "CM Bhagwant Mann unveils Rs 500 crore development push to boost manufacturing and create jobs across Punjab." \
  "Punjab Chief Minister Bhagwant Mann today announced a comprehensive industrial policy aimed at attracting investment worth Rs 500 crore to the state. The new policy offers tax incentives, single-window clearance, and dedicated industrial corridors near Ludhiana, Mohali, and Amritsar.

Speaking at a press conference in Chandigarh, the CM said the policy will create over 50,000 jobs in the next two years. The government has earmarked land near key transport hubs for industrial parks focused on textiles, electronics, and food processing.

Industry leaders have welcomed the move. The Federation of Punjab Industry estimates that the policy could lift state GDP by 1.2 percent within three years." \
  "$IMG_POLITICS" "Newswave Desk" "politics" "punjab")

add_translation "$A1" "hi" \
  "पंजाब सरकार ने नई औद्योगिक नीति की घोषणा की" \
  "मुख्यमंत्री भगवंत मान ने उत्पादन बढ़ाने और रोज़गार सृजन के लिए 500 करोड़ रुपये की विकास योजना का अनावरण किया।" \
  "पंजाब के मुख्यमंत्री भगवंत मान ने आज एक व्यापक औद्योगिक नीति की घोषणा की, जिसका उद्देश्य राज्य में 500 करोड़ रुपये का निवेश आकर्षित करना है। नई नीति में कर रियायतें, एकल खिड़की मंज़ूरी, और लुधियाना, मोहाली व अमृतसर के पास समर्पित औद्योगिक गलियारे शामिल हैं।

चंडीगढ़ में एक प्रेस कॉन्फ्रेंस को संबोधित करते हुए मुख्यमंत्री ने कहा कि यह नीति अगले दो वर्षों में 50,000 से अधिक नौकरियाँ पैदा करेगी।

उद्योग जगत के नेताओं ने इस कदम का स्वागत किया है।"

add_translation "$A1" "pa" \
  "ਪੰਜਾਬ ਸਰਕਾਰ ਨੇ ਨਵੀਂ ਉਦਯੋਗਿਕ ਨੀਤੀ ਦਾ ਐਲਾਨ ਕੀਤਾ" \
  "ਮੁੱਖ ਮੰਤਰੀ ਭਗਵੰਤ ਮਾਨ ਨੇ ਨਿਰਮਾਣ ਨੂੰ ਵਧਾਉਣ ਅਤੇ ਨੌਕਰੀਆਂ ਪੈਦਾ ਕਰਨ ਲਈ 500 ਕਰੋੜ ਰੁਪਏ ਦੀ ਵਿਕਾਸ ਯੋਜਨਾ ਦਾ ਉਦਘਾਟਨ ਕੀਤਾ।" \
  "ਪੰਜਾਬ ਦੇ ਮੁੱਖ ਮੰਤਰੀ ਭਗਵੰਤ ਮਾਨ ਨੇ ਅੱਜ ਇੱਕ ਵਿਆਪਕ ਉਦਯੋਗਿਕ ਨੀਤੀ ਦਾ ਐਲਾਨ ਕੀਤਾ, ਜਿਸ ਦਾ ਮਕਸਦ ਰਾਜ ਵਿੱਚ 500 ਕਰੋੜ ਰੁਪਏ ਦਾ ਨਿਵੇਸ਼ ਖਿੱਚਣਾ ਹੈ। ਨਵੀਂ ਨੀਤੀ ਵਿੱਚ ਟੈਕਸ ਛੋਟਾਂ, ਇੱਕ ਖਿੜਕੀ ਮਨਜ਼ੂਰੀ ਅਤੇ ਲੁਧਿਆਣਾ, ਮੋਹਾਲੀ ਅਤੇ ਅੰਮ੍ਰਿਤਸਰ ਨੇੜੇ ਉਦਯੋਗਿਕ ਗਲਿਆਰੇ ਸ਼ਾਮਲ ਹਨ।

ਚੰਡੀਗੜ੍ਹ ਵਿੱਚ ਪ੍ਰੈਸ ਕਾਨਫਰੰਸ ਦੌਰਾਨ ਮੁੱਖ ਮੰਤਰੀ ਨੇ ਕਿਹਾ ਕਿ ਇਹ ਨੀਤੀ ਅਗਲੇ ਦੋ ਸਾਲਾਂ ਵਿੱਚ 50,000 ਤੋਂ ਵੱਧ ਨੌਕਰੀਆਂ ਪੈਦਾ ਕਰੇਗੀ।

ਉਦਯੋਗਿਕ ਨੇਤਾਵਾਂ ਨੇ ਇਸ ਕਦਮ ਦਾ ਸਵਾਗਤ ਕੀਤਾ ਹੈ।"

# 2. India vs Australia - Sports
echo ">> Creating: Shubman Gill Stars as India Seal Series Win"
A2=$(create_article \
  "Shubman Gill Stars as India Seal Series Win in Style" \
  "Centurion Shubman Gill leads India to a commanding series victory over Australia at the M Chinnaswamy Stadium." \
  "India produced a clinical performance to seal the series 3-1 against Australia. Opener Shubman Gill smashed a brilliant 142 off 128 balls, anchoring the innings with calm aggression.

Captain Rohit Sharma praised the team's discipline. The bowlers, led by Jasprit Bumrah's four-wicket haul, restricted Australia to 248. India chased the target with three overs to spare.

The win extends India's home record and lifts them to the top of the ICC ODI rankings." \
  "$IMG_CRICKET" "Newswave Desk" "sports" "national")

add_translation "$A2" "hi" \
  "शुभमन गिल चमके, भारत ने श्रृंखला अपने नाम की" \
  "एम चिन्नास्वामी स्टेडियम में शुभमन गिल के शतक की मदद से भारत ने ऑस्ट्रेलिया पर शानदार जीत हासिल की।" \
  "भारत ने ऑस्ट्रेलिया के खिलाफ 3-1 से श्रृंखला अपने नाम कर ली। ओपनर शुभमन गिल ने 128 गेंदों में 142 रन बनाए।

कप्तान रोहित शर्मा ने टीम के अनुशासन की प्रशंसा की। गेंदबाजों ने ऑस्ट्रेलिया को 248 पर समेट दिया।

जीत के साथ भारत आईसीसी एकदिवसीय रैंकिंग में शीर्ष पर पहुँच गया।"

add_translation "$A2" "pa" \
  "ਸ਼ੁਭਮਨ ਗਿੱਲ ਦੇ ਸੈਂਕੜੇ ਦੇ ਸਹਾਰੇ ਭਾਰਤ ਨੇ ਜਿੱਤੀ ਲੜੀ" \
  "ਐਮ ਚਿੰਨਾਸਵਾਮੀ ਸਟੇਡੀਅਮ ਵਿੱਚ ਸ਼ੁਭਮਨ ਗਿੱਲ ਦੇ ਸੈਂਕੜੇ ਨਾਲ ਭਾਰਤ ਨੇ ਆਸਟ੍ਰੇਲੀਆ ਉੱਤੇ ਸ਼ਾਨਦਾਰ ਜਿੱਤ ਹਾਸਲ ਕੀਤੀ।" \
  "ਭਾਰਤ ਨੇ ਆਸਟ੍ਰੇਲੀਆ ਵਿਰੁੱਧ 3-1 ਨਾਲ ਲੜੀ ਜਿੱਤ ਲਈ। ਓਪਨਰ ਸ਼ੁਭਮਨ ਗਿੱਲ ਨੇ 128 ਗੇਂਦਾਂ ਵਿੱਚ 142 ਦੌੜਾਂ ਬਣਾਈਆਂ।

ਕਪਤਾਨ ਰੋਹਿਤ ਸ਼ਰਮਾ ਨੇ ਟੀਮ ਦੇ ਅਨੁਸ਼ਾਸਨ ਦੀ ਤਾਰੀਫ਼ ਕੀਤੀ। ਗੇਂਦਬਾਜ਼ਾਂ ਨੇ ਆਸਟ੍ਰੇਲੀਆ ਨੂੰ 248 ਉੱਤੇ ਸਮੇਟ ਦਿੱਤਾ।

ਜਿੱਤ ਨਾਲ ਭਾਰਤ ICC ODI ਰੈਂਕਿੰਗ ਵਿੱਚ ਸਿਖਰ ਉੱਤੇ ਪਹੁੰਚ ਗਿਆ ਹੈ।"

# 3. Sensex - Business
echo ">> Creating: Sensex Surges 600 Points"
A3=$(create_article \
  "Sensex Surges 600 Points as Markets Rally for Fifth Day" \
  "Indian benchmark indices closed at record highs led by IT, banking, and auto stocks." \
  "The BSE Sensex jumped 612 points to close at 76,450, while the Nifty 50 ended above 23,200 for the first time. Gains were driven by Infosys, HDFC Bank, and Tata Motors.

Foreign portfolio investors poured in over Rs 2,800 crore. Analysts cite easing inflation and strong Q4 earnings as catalysts.

Markets are now up 18 percent year to date." \
  "$IMG_MARKET" "Newswave Desk" "business" "national")

add_translation "$A3" "hi" \
  "सेंसेक्स 600 अंक चढ़ा, पाँचवें दिन तेज़ी" \
  "आईटी, बैंकिंग और ऑटो शेयरों की अगुआई में भारतीय शेयर बाज़ार रिकॉर्ड ऊँचाई पर बंद हुए।" \
  "बीएसई सेंसेक्स 612 अंक उछलकर 76,450 पर बंद हुआ, वहीं निफ्टी 50 पहली बार 23,200 के पार बंद हुआ।

विदेशी निवेशकों ने 2,800 करोड़ रुपये से अधिक निवेश किया। विश्लेषकों के अनुसार महँगाई में कमी और मज़बूत तिमाही नतीजे प्रमुख वजह हैं।

बाज़ार साल भर में 18 प्रतिशत बढ़ चुके हैं।"

add_translation "$A3" "pa" \
  "ਸੈਂਸੈਕਸ 600 ਅੰਕ ਚੜ੍ਹਿਆ, ਪੰਜਵੇਂ ਦਿਨ ਤੇਜ਼ੀ" \
  "ਆਈਟੀ, ਬੈਂਕਿੰਗ ਅਤੇ ਆਟੋ ਸ਼ੇਅਰਾਂ ਦੀ ਅਗਵਾਈ ਵਿੱਚ ਭਾਰਤੀ ਸ਼ੇਅਰ ਬਾਜ਼ਾਰ ਰਿਕਾਰਡ ਉੱਚਾਈ ਉੱਤੇ ਬੰਦ ਹੋਏ।" \
  "ਬੀਐਸਈ ਸੈਂਸੈਕਸ 612 ਅੰਕ ਉਛਲ ਕੇ 76,450 ਉੱਤੇ ਬੰਦ ਹੋਇਆ, ਅਤੇ ਨਿਫਟੀ 50 ਪਹਿਲੀ ਵਾਰ 23,200 ਤੋਂ ਉੱਪਰ ਬੰਦ ਹੋਇਆ।

ਵਿਦੇਸ਼ੀ ਨਿਵੇਸ਼ਕਾਂ ਨੇ 2,800 ਕਰੋੜ ਰੁਪਏ ਤੋਂ ਵੱਧ ਨਿਵੇਸ਼ ਕੀਤਾ। ਮਾਹਿਰਾਂ ਅਨੁਸਾਰ ਮਹਿੰਗਾਈ ਘਟਣਾ ਅਤੇ ਮਜ਼ਬੂਤ ਤਿਮਾਹੀ ਨਤੀਜੇ ਮੁੱਖ ਕਾਰਨ ਹਨ।

ਬਾਜ਼ਾਰ ਸਾਲ ਵਿੱਚ 18 ਪ੍ਰਤੀਸ਼ਤ ਵੱਧ ਚੁੱਕੇ ਹਨ।"

# 4. Health
echo ">> Creating: Summer Health Alert"
A4=$(create_article \
  "Summer Health Alert: Tips to Stay Safe in Rising Heat" \
  "Doctors warn of dehydration and heat stroke as temperatures climb above 42 degrees in north India." \
  "With temperatures soaring across north India, doctors are urging residents to stay hydrated and avoid stepping out between noon and 4 pm. Drink at least three litres of water daily and wear light cotton clothing.

Hospitals in Delhi and Chandigarh report a 30 percent rise in heat-related cases. Vulnerable groups include elderly people, children, and outdoor workers.

Symptoms of heat stroke include dizziness, nausea, and rapid heartbeat. Seek medical help immediately if these appear." \
  "$IMG_HEALTH" "Dr. Anjali Mehta" "health" "national")

add_translation "$A4" "hi" \
  "गर्मी से बचाव की चेतावनी: सुरक्षित रहने के टिप्स" \
  "उत्तर भारत में तापमान 42 डिग्री पार करने के साथ डॉक्टरों ने डिहाइड्रेशन और लू की चेतावनी जारी की।" \
  "उत्तर भारत में बढ़ते तापमान के बीच डॉक्टरों ने लोगों से दिन में तीन लीटर पानी पीने और दोपहर 12 से 4 बजे के बीच बाहर न निकलने की सलाह दी है।

दिल्ली और चंडीगढ़ के अस्पतालों में गर्मी से जुड़े मामलों में 30 प्रतिशत वृद्धि दर्ज हुई है।

लू के लक्षणों में चक्कर, मतली और तेज़ धड़कन शामिल हैं। तुरंत चिकित्सा सहायता लें।"

add_translation "$A4" "pa" \
  "ਗਰਮੀ ਤੋਂ ਬਚਾਅ ਦੀ ਚੇਤਾਵਨੀ: ਸੁਰੱਖਿਅਤ ਰਹਿਣ ਦੇ ਨੁਕਤੇ" \
  "ਉੱਤਰੀ ਭਾਰਤ ਵਿੱਚ ਤਾਪਮਾਨ 42 ਡਿਗਰੀ ਤੋਂ ਉੱਪਰ ਜਾਣ ਨਾਲ ਡਾਕਟਰਾਂ ਨੇ ਡੀਹਾਈਡਰੇਸ਼ਨ ਅਤੇ ਲੂ ਦੀ ਚੇਤਾਵਨੀ ਜਾਰੀ ਕੀਤੀ।" \
  "ਉੱਤਰੀ ਭਾਰਤ ਵਿੱਚ ਵਧ ਰਹੇ ਤਾਪਮਾਨ ਦੌਰਾਨ ਡਾਕਟਰਾਂ ਨੇ ਲੋਕਾਂ ਨੂੰ ਦਿਨ ਵਿੱਚ ਤਿੰਨ ਲੀਟਰ ਪਾਣੀ ਪੀਣ ਅਤੇ ਦੁਪਹਿਰ 12 ਤੋਂ 4 ਵਜੇ ਵਿਚਕਾਰ ਬਾਹਰ ਨਾ ਨਿਕਲਣ ਦੀ ਸਲਾਹ ਦਿੱਤੀ ਹੈ।

ਦਿੱਲੀ ਅਤੇ ਚੰਡੀਗੜ੍ਹ ਦੇ ਹਸਪਤਾਲਾਂ ਵਿੱਚ ਗਰਮੀ ਨਾਲ ਜੁੜੇ ਮਾਮਲੇ 30 ਪ੍ਰਤੀਸ਼ਤ ਵਧੇ ਹਨ।

ਲੂ ਦੇ ਲੱਛਣਾਂ ਵਿੱਚ ਚੱਕਰ, ਮਤਲੀ ਅਤੇ ਤੇਜ਼ ਧੜਕਨ ਸ਼ਾਮਲ ਹਨ।"

# 5. Auto
echo ">> Creating: Tata Launches New SUV Safari Adventure+"
A5=$(create_article \
  "Tata Launches New SUV Safari Adventure+" \
  "Tata Motors unveils a rugged variant with off-road tyres and electronic differential lock starting at Rs 22.5 lakh." \
  "Tata Motors today launched the Safari Adventure+ in Mumbai, targeting buyers who want a true off-road experience without sacrificing comfort. The new variant features all-terrain tyres, an electronic differential lock, and a redesigned bumper.

Bookings are open from today. Deliveries begin next month across 250 dealerships nationwide.

The Adventure+ comes in three colours and is offered with both manual and automatic transmissions." \
  "$IMG_AUTO" "Newswave Desk" "automobile" "national")

add_translation "$A5" "hi" \
  "टाटा ने लॉन्च की नई सफारी एडवेंचर प्लस" \
  "ऑफ-रोड टायर और इलेक्ट्रॉनिक डिफरेंशियल लॉक के साथ नई एसयूवी की शुरुआती कीमत 22.5 लाख रुपये।" \
  "टाटा मोटर्स ने आज मुंबई में सफारी एडवेंचर प्लस लॉन्च की। नया वेरिएंट ऑल-टेरेन टायर, इलेक्ट्रॉनिक डिफरेंशियल लॉक और नए डिज़ाइन के बंपर के साथ आता है।

बुकिंग आज से शुरू है। अगले महीने से देश भर में 250 डीलरशिप पर डिलीवरी होगी।

एडवेंचर प्लस तीन रंगों में उपलब्ध है और मैनुअल व ऑटोमैटिक दोनों ट्रांसमिशन में आता है।"

add_translation "$A5" "pa" \
  "ਟਾਟਾ ਨੇ ਲਾਂਚ ਕੀਤੀ ਨਵੀਂ ਸਫ਼ਾਰੀ ਐਡਵੈਂਚਰ ਪਲੱਸ" \
  "ਆਫ-ਰੋਡ ਟਾਇਰ ਅਤੇ ਇਲੈਕਟ੍ਰਾਨਿਕ ਡਿਫਰੈਂਸ਼ੀਅਲ ਲਾਕ ਨਾਲ ਨਵੀਂ SUV ਦੀ ਸ਼ੁਰੂਆਤੀ ਕੀਮਤ 22.5 ਲੱਖ ਰੁਪਏ।" \
  "ਟਾਟਾ ਮੋਟਰਜ਼ ਨੇ ਅੱਜ ਮੁੰਬਈ ਵਿੱਚ ਸਫ਼ਾਰੀ ਐਡਵੈਂਚਰ ਪਲੱਸ ਲਾਂਚ ਕੀਤੀ। ਨਵਾਂ ਵੇਰੀਐਂਟ ਆਲ-ਟੇਰੇਨ ਟਾਇਰ, ਇਲੈਕਟ੍ਰਾਨਿਕ ਡਿਫਰੈਂਸ਼ੀਅਲ ਲਾਕ ਅਤੇ ਨਵੇਂ ਡਿਜ਼ਾਈਨ ਦੇ ਬੰਪਰ ਨਾਲ ਆਉਂਦਾ ਹੈ।

ਬੁਕਿੰਗ ਅੱਜ ਤੋਂ ਸ਼ੁਰੂ ਹੈ। ਅਗਲੇ ਮਹੀਨੇ ਦੇਸ਼ ਭਰ ਵਿੱਚ 250 ਡੀਲਰਸ਼ਿਪਾਂ ਉੱਤੇ ਡਿਲੀਵਰੀ ਸ਼ੁਰੂ ਹੋਵੇਗੀ।"

# 6. Crime
echo ">> Creating: Ludhiana Police Bust Car Theft Racket"
A6=$(create_article \
  "Ludhiana Police Bust Gang Involved in Car Theft Racket" \
  "Six suspects arrested with 18 stolen vehicles in a coordinated raid across Punjab and Haryana." \
  "Ludhiana police on Tuesday arrested six members of an interstate car theft gang. The raid recovered 18 vehicles worth more than Rs 2.5 crore.

The gang allegedly operated for over two years, repainting and reselling stolen vehicles in Haryana and Rajasthan. Senior officers said the network used fake registration documents.

Investigations are ongoing. Police expect more arrests in the coming days." \
  "$IMG_POLITICS" "Crime Reporter" "crime" "punjab")

add_translation "$A6" "hi" \
  "लुधियाना पुलिस ने कार चोर गिरोह का पर्दाफ़ाश किया" \
  "पंजाब और हरियाणा में छापेमारी के दौरान 18 चोरी की गाड़ियों के साथ छह आरोपी गिरफ़्तार।" \
  "लुधियाना पुलिस ने मंगलवार को अंतर्राज्यीय कार चोर गिरोह के छह सदस्यों को गिरफ्तार किया। छापे में 2.5 करोड़ रुपये से अधिक की 18 गाड़ियाँ बरामद हुईं।

गिरोह दो साल से अधिक समय से सक्रिय था और हरियाणा व राजस्थान में चोरी की गाड़ियाँ बेच रहा था।

जाँच जारी है। आने वाले दिनों में और गिरफ्तारियाँ संभव हैं।"

add_translation "$A6" "pa" \
  "ਲੁਧਿਆਣਾ ਪੁਲਿਸ ਨੇ ਕਾਰ ਚੋਰ ਗਿਰੋਹ ਦਾ ਪਰਦਾਫ਼ਾਸ਼ ਕੀਤਾ" \
  "ਪੰਜਾਬ ਅਤੇ ਹਰਿਆਣਾ ਵਿੱਚ ਛਾਪੇਮਾਰੀ ਦੌਰਾਨ 18 ਚੋਰੀ ਦੀਆਂ ਗੱਡੀਆਂ ਨਾਲ ਛੇ ਮੁਲਜ਼ਮ ਗ੍ਰਿਫ਼ਤਾਰ।" \
  "ਲੁਧਿਆਣਾ ਪੁਲਿਸ ਨੇ ਮੰਗਲਵਾਰ ਨੂੰ ਅੰਤਰਰਾਜੀ ਕਾਰ ਚੋਰ ਗਿਰੋਹ ਦੇ ਛੇ ਮੈਂਬਰ ਗ੍ਰਿਫ਼ਤਾਰ ਕੀਤੇ। ਛਾਪੇ ਵਿੱਚ 2.5 ਕਰੋੜ ਰੁਪਏ ਤੋਂ ਵੱਧ ਦੀਆਂ 18 ਗੱਡੀਆਂ ਬਰਾਮਦ ਹੋਈਆਂ।

ਗਿਰੋਹ ਦੋ ਸਾਲਾਂ ਤੋਂ ਵੱਧ ਸਮੇਂ ਤੋਂ ਸਰਗਰਮ ਸੀ ਅਤੇ ਹਰਿਆਣਾ ਅਤੇ ਰਾਜਸਥਾਨ ਵਿੱਚ ਚੋਰੀ ਦੀਆਂ ਗੱਡੀਆਂ ਵੇਚ ਰਿਹਾ ਸੀ।

ਜਾਂਚ ਜਾਰੀ ਹੈ।"

# 7. Entertainment
echo ">> Creating: Aashiqui 3 Release Date"
A7=$(create_article \
  "Kartik Aaryan's Aashiqui 3 Release Date Announced" \
  "Music director T-Series confirms the romantic drama hits theatres this Diwali, with Kartik Aaryan in the lead." \
  "T-Series and Mukesh Bhatt have officially announced that Aashiqui 3 will release this Diwali. Kartik Aaryan plays the male lead, with Triptii Dimri reportedly cast opposite him.

The film promises a fresh musical score by Pritam, with lyrics by Irshad Kamil. Director Anurag Basu calls it a tribute to the original 1990 film.

Shooting is in its final schedule in Kashmir. The first teaser drops next month." \
  "$IMG_ENT" "Entertainment Desk" "entertainment" "national")

add_translation "$A7" "hi" \
  "कार्तिक आर्यन की 'आशिकी 3' की रिलीज़ डेट घोषित" \
  "टी-सीरीज़ ने पुष्टि की कि रोमांटिक ड्रामा इस दीवाली रिलीज़ होगी।" \
  "टी-सीरीज़ और मुकेश भट्ट ने आधिकारिक तौर पर घोषणा की है कि 'आशिकी 3' इस दीवाली रिलीज़ होगी। कार्तिक आर्यन मुख्य भूमिका में हैं, उनके साथ त्रिप्ती डिमरी की कास्टिंग की ख़बर है।

संगीत प्रीतम का होगा और गीत इरशाद कामिल लिखेंगे। निर्देशक अनुराग बसु ने इसे 1990 की मूल फ़िल्म को श्रद्धांजलि बताया है।

शूटिंग कश्मीर में अंतिम चरण में है।"

add_translation "$A7" "pa" \
  "ਕਾਰਤਿਕ ਆਰੀਅਨ ਦੀ 'ਆਸ਼ਿਕੀ 3' ਦੀ ਰਿਲੀਜ਼ ਡੇਟ ਐਲਾਨੀ" \
  "ਟੀ-ਸੀਰੀਜ਼ ਨੇ ਪੁਸ਼ਟੀ ਕੀਤੀ ਕਿ ਰੋਮਾਂਟਿਕ ਡਰਾਮਾ ਇਸ ਦੀਵਾਲੀ ਰਿਲੀਜ਼ ਹੋਵੇਗਾ।" \
  "ਟੀ-ਸੀਰੀਜ਼ ਅਤੇ ਮੁਕੇਸ਼ ਭੱਟ ਨੇ ਆਧਿਕਾਰਿਕ ਤੌਰ ਉੱਤੇ ਐਲਾਨ ਕੀਤਾ ਹੈ ਕਿ 'ਆਸ਼ਿਕੀ 3' ਇਸ ਦੀਵਾਲੀ ਰਿਲੀਜ਼ ਹੋਵੇਗੀ। ਕਾਰਤਿਕ ਆਰੀਅਨ ਮੁੱਖ ਭੂਮਿਕਾ ਵਿੱਚ ਹਨ।

ਸੰਗੀਤ ਪ੍ਰੀਤਮ ਦਾ ਹੋਵੇਗਾ ਅਤੇ ਗੀਤ ਇਰਸ਼ਾਦ ਕਾਮਿਲ ਲਿਖਣਗੇ।

ਸ਼ੂਟਿੰਗ ਕਸ਼ਮੀਰ ਵਿੱਚ ਆਖਰੀ ਪੜਾਅ ਉੱਤੇ ਹੈ।"

# 8. Heatwave / National
echo ">> Creating: IMD Issues Thunderstorm Alert"
A8=$(create_article \
  "IMD Issues Thunderstorm and Rain Alert in North India" \
  "Met department forecasts heavy showers in Punjab, Haryana, and Himachal over the next 48 hours." \
  "The India Meteorological Department issued an orange alert for thunderstorms and heavy rain across north India. Punjab, Haryana, and Himachal Pradesh are likely to see widespread showers over the next 48 hours.

Farmers have been advised to protect harvested wheat. Authorities are on standby for waterlogging in low-lying urban areas of Chandigarh and Ludhiana.

The system is expected to weaken by Friday morning." \
  "$IMG_HEAT" "Newswave Desk" "politics" "haryana")

add_translation "$A8" "hi" \
  "उत्तर भारत में आँधी-तूफ़ान का अलर्ट" \
  "मौसम विभाग ने अगले 48 घंटों में पंजाब, हरियाणा और हिमाचल में भारी बारिश की चेतावनी जारी की।" \
  "भारतीय मौसम विभाग ने उत्तर भारत के लिए आँधी-तूफ़ान और भारी बारिश को लेकर ऑरेंज अलर्ट जारी किया है। अगले 48 घंटों में पंजाब, हरियाणा और हिमाचल में बारिश की संभावना है।

किसानों को कटी हुई गेहूँ की फ़सल बचाने की सलाह दी गई है।

शुक्रवार सुबह तक मौसम सामान्य होने की उम्मीद है।"

add_translation "$A8" "pa" \
  "ਉੱਤਰੀ ਭਾਰਤ ਵਿੱਚ ਹਨੇਰੀ-ਤੂਫ਼ਾਨ ਦਾ ਅਲਰਟ" \
  "ਮੌਸਮ ਵਿਭਾਗ ਨੇ ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਪੰਜਾਬ, ਹਰਿਆਣਾ ਅਤੇ ਹਿਮਾਚਲ ਵਿੱਚ ਭਾਰੀ ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ ਜਾਰੀ ਕੀਤੀ।" \
  "ਭਾਰਤੀ ਮੌਸਮ ਵਿਭਾਗ ਨੇ ਉੱਤਰੀ ਭਾਰਤ ਲਈ ਹਨੇਰੀ-ਤੂਫ਼ਾਨ ਅਤੇ ਭਾਰੀ ਮੀਂਹ ਨੂੰ ਲੈ ਕੇ ਔਰੇਂਜ ਅਲਰਟ ਜਾਰੀ ਕੀਤਾ ਹੈ। ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਪੰਜਾਬ, ਹਰਿਆਣਾ ਅਤੇ ਹਿਮਾਚਲ ਵਿੱਚ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।

ਕਿਸਾਨਾਂ ਨੂੰ ਕੱਟੀ ਹੋਈ ਕਣਕ ਦੀ ਫ਼ਸਲ ਬਚਾਉਣ ਦੀ ਸਲਾਹ ਦਿੱਤੀ ਗਈ ਹੈ।

ਸ਼ੁੱਕਰਵਾਰ ਸਵੇਰ ਤੱਕ ਮੌਸਮ ਆਮ ਹੋਣ ਦੀ ਉਮੀਦ ਹੈ।"

echo
echo ">> All 8 articles seeded with EN + HI + PA translations"
echo ">> Switch language in header on http://localhost:3000 to test"
