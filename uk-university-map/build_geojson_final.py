#!/usr/bin/env python3
"""
Build comprehensive GeoJSON for UK University Map tribute to Peter Burden.
Data sources:
1. learning-provider.data.ac.uk (UKPRN, coordinates, groups, HESA ID, website)
2. Wikidata via P4971 UKPRN (founded year, Wikipedia URL, better coordinates)
"""

import csv
import json
import re
from collections import defaultdict

# ── 1. Load learning-providers-plus.csv ──────────────────────────────────────
print("Loading learning-providers-plus.csv...")
providers = {}
with open("/home/ubuntu/learning-providers-plus.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        ukprn = row["UKPRN"].strip()
        providers[ukprn] = {
            "ukprn": ukprn,
            "name": row["VIEW_NAME"].strip() or row["PROVIDER_NAME"].strip(),
            "official_name": row["PROVIDER_NAME"].strip(),
            "town": row["TOWN"].strip(),
            "postcode": row["POSTCODE"].strip(),
            "website": row["WEBSITE_URL"].strip(),
            "wikipedia": row["WIKIPEDIA_URL"].strip(),
            "groups": [g.strip() for g in row["GROUPS"].split(",") if g.strip()],
            "lat": float(row["LATITUDE"]) if row["LATITUDE"].strip() else None,
            "lon": float(row["LONGITUDE"]) if row["LONGITUDE"].strip() else None,
            "hesa_id": row["HESA_ID"].strip(),
        }

print(f"  Loaded {len(providers)} providers")

# ── 2. Load Wikidata results (P4971 UKPRN) ────────────────────────────────────
print("Loading Wikidata results...")
with open("/home/ubuntu/wikidata_ukprn.json") as f:
    wikidata_raw = json.load(f)

# Index by UKPRN - take best entry (prefer one with Wikipedia URL)
wikidata_by_ukprn = {}
for row in wikidata_raw:
    ukprn = row.get("ukprn", {}).get("value", "")
    if not ukprn or ukprn not in providers:
        continue
    
    lat_str = row.get("lat", {}).get("value", "")
    lon_str = row.get("lon", {}).get("value", "")
    founded_str = row.get("founded", {}).get("value", "")
    wiki = row.get("wikipedia", {}).get("value", "")
    
    lat = float(lat_str) if lat_str else None
    lon = float(lon_str) if lon_str else None
    founded = int(founded_str[:4]) if founded_str and len(founded_str) >= 4 else None
    
    entry = {
        "lat": lat,
        "lon": lon,
        "founded": founded,
        "wikipedia": wiki,
    }
    
    # Keep entry with Wikipedia URL, or first entry
    if ukprn not in wikidata_by_ukprn:
        wikidata_by_ukprn[ukprn] = entry
    elif wiki and not wikidata_by_ukprn[ukprn].get("wikipedia"):
        # Update with Wikipedia URL but keep existing coords if better
        existing = wikidata_by_ukprn[ukprn]
        if not existing.get("lat") and lat:
            existing["lat"] = lat
            existing["lon"] = lon
        if not existing.get("founded") and founded:
            existing["founded"] = founded
        existing["wikipedia"] = wiki

print(f"  Wikidata entries matched to providers: {len(wikidata_by_ukprn)}")

# ── 3. Group labels and institution type classification ───────────────────────
GROUP_LABELS = {
    "Russell_Group": "Russell Group",
    "Million_Plus": "Million+",
    "University_Alliance": "University Alliance",
    "Cathedrals_Group": "Cathedrals Group",
    "1994_Group": "1994 Group",
    "N8_Research_Partnership": "N8 Research Partnership",
    "White_Rose_University_Consortium": "White Rose Consortium",
    "GW4": "GW4 Alliance",
    "M5_Universities": "M5 Universities",
    "Oxbridge": "Oxbridge",
    "NCUK": "NCUK",
    "ABSA": "ABSA",
    "Science_and_Engineering_South": "Science & Engineering South",
}

# Color coding matching Peter Burden's original scheme (adapted for modern era)
# Original: red=university, orange=university sector college, yellow=FE, green=school
# Modern: Russell Group (deep red), research universities (red), modern universities (orange),
#         specialist arts (purple), cathedrals group (yellow-orange), other HE (blue)
TYPE_CONFIG = {
    "russell_group": {
        "color": "#C0392B",
        "label": "Russell Group University",
        "marker": "diamond",
        "order": 1
    },
    "research_university": {
        "color": "#E74C3C",
        "label": "Research University",
        "marker": "diamond",
        "order": 2
    },
    "university": {
        "color": "#E67E22",
        "label": "University",
        "marker": "star",
        "order": 3
    },
    "modern_university": {
        "color": "#F39C12",
        "label": "Modern University",
        "marker": "star",
        "order": 4
    },
    "cathedrals_group": {
        "color": "#8E44AD",
        "label": "Cathedrals Group",
        "marker": "circle",
        "order": 5
    },
    "specialist_arts": {
        "color": "#9B59B6",
        "label": "Specialist Arts Institution",
        "marker": "circle",
        "order": 6
    },
    "specialist_medical": {
        "color": "#27AE60",
        "label": "Specialist Medical/Scientific",
        "marker": "circle",
        "order": 7
    },
    "higher_education": {
        "color": "#2980B9",
        "label": "Higher Education Institution",
        "marker": "circle",
        "order": 8
    },
}

def classify_institution(provider):
    groups = provider.get("groups", [])
    name = provider.get("name", "").lower()
    
    if "Russell_Group" in groups or "Oxbridge" in groups:
        return "russell_group"
    elif "1994_Group" in groups or "N8_Research_Partnership" in groups:
        return "research_university"
    elif any(x in name for x in ["conservatoire", "music", "drama", "dance", "art", "film", "ballet", "theatre"]):
        return "specialist_arts"
    elif any(x in name for x in ["medical", "dental", "veterinary", "pharmacy", "hygiene", "tropical"]):
        return "specialist_medical"
    elif "Cathedrals_Group" in groups:
        return "cathedrals_group"
    elif "Million_Plus" in groups or "University_Alliance" in groups or "GW4" in groups:
        return "modern_university"
    elif "university" in name or "college" in name:
        return "university"
    else:
        return "higher_education"

# ── 4. Build GeoJSON features ─────────────────────────────────────────────────
print("Building GeoJSON features...")
features = []
skipped = []

for ukprn, provider in providers.items():
    # Get coordinates - prefer learning-providers data (postcode-based, reliable)
    lat = provider["lat"]
    lon = provider["lon"]
    
    # Get Wikidata enrichment
    wiki_data = wikidata_by_ukprn.get(ukprn, {})
    
    # Use Wikidata coords if provider coords missing
    if (lat is None or lon is None) and wiki_data.get("lat"):
        lat = wiki_data["lat"]
        lon = wiki_data["lon"]
    
    # Skip if still no coordinates
    if lat is None or lon is None:
        skipped.append(provider["name"])
        continue
    
    # Validate UK coordinates (rough bounding box including Channel Islands)
    if not (-8.5 <= lon <= 2.0 and 49.0 <= lat <= 61.0):
        skipped.append(f"{provider['name']} (out of bounds: {lat:.2f}, {lon:.2f})")
        continue
    
    # Build properties
    inst_type = classify_institution(provider)
    type_config = TYPE_CONFIG.get(inst_type, TYPE_CONFIG["higher_education"])
    groups_display = [GROUP_LABELS.get(g, g.replace("_", " ")) for g in provider["groups"]]
    
    # Wikipedia URL - prefer learning-providers, fallback to Wikidata
    wikipedia = provider.get("wikipedia") or wiki_data.get("wikipedia", "")
    
    # Website
    website = provider.get("website", "")
    
    # Founded year from Wikidata
    founded = wiki_data.get("founded")
    
    # Discover Uni URL (using UKPRN)
    discover_uni_url = f"https://discoveruni.gov.uk/institution-overview/{ukprn}/" if ukprn else ""
    
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [round(lon, 6), round(lat, 6)]
        },
        "properties": {
            "ukprn": ukprn,
            "name": provider["name"],
            "official_name": provider["official_name"],
            "town": provider["town"],
            "postcode": provider["postcode"],
            "website": website,
            "wikipedia": wikipedia,
            "discover_uni_url": discover_uni_url,
            "groups": provider["groups"],
            "groups_display": groups_display,
            "institution_type": inst_type,
            "type_label": type_config["label"],
            "color": type_config["color"],
            "marker": type_config["marker"],
            "type_order": type_config["order"],
            "founded": founded,
            "hesa_id": provider["hesa_id"],
        }
    }
    features.append(feature)

print(f"  Built {len(features)} features with coordinates")
if skipped:
    print(f"  Skipped {len(skipped)}: {skipped}")

# ── 5. Save GeoJSON ───────────────────────────────────────────────────────────
geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "title": "UK Higher Education Providers",
        "description": "A tribute to Peter Burden's UK University Maps (University of Wolverhampton, 1994–2004). Data from learning-provider.data.ac.uk, Wikidata, and HESA Discover Uni.",
        "sources": [
            "learning-provider.data.ac.uk (UKPRN, coordinates, groups, HESA ID)",
            "Wikidata P4971 (UKPRN linkage, founded year, Wikipedia URLs)",
            "HESA Discover Uni dataset (institution type classification)"
        ],
        "tribute": "In tribute to Peter Burden, University of Wolverhampton, who created the original UK University Active Map in July 1994.",
        "count": len(features),
        "generated": "2026-07-19"
    },
    "features": features
}

with open("/home/ubuntu/uk_universities.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2, ensure_ascii=False)

print(f"\nSaved uk_universities.geojson with {len(features)} institutions")

# Print summary stats
types = defaultdict(int)
for f in features:
    types[f["properties"]["institution_type"]] += 1
print("\nInstitution types:")
for t, count in sorted(types.items(), key=lambda x: -x[1]):
    label = TYPE_CONFIG.get(t, {}).get("label", t)
    print(f"  {label}: {count}")

with_founded = sum(1 for f in features if f["properties"]["founded"])
with_wikipedia = sum(1 for f in features if f["properties"]["wikipedia"])
print(f"\nWith founded year: {with_founded}/{len(features)}")
print(f"With Wikipedia: {with_wikipedia}/{len(features)}")

# Sample output
print("\nSample features:")
for f in features[:3]:
    p = f["properties"]
    coords = f["geometry"]["coordinates"]
    print(f"  {p['name']} ({p['ukprn']}): [{coords[1]:.3f}, {coords[0]:.3f}], type={p['institution_type']}, founded={p['founded']}")
