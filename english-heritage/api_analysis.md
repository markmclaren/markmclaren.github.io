# English Heritage API Analysis

## API Endpoint
- URL: https://www.english-heritage.org.uk/api/PropertySearch/GetAll
- Returns JSON with Total count and Results array

## Key Data Fields
- **ID**: Unique identifier
- **Title**: Property name
- **Summary**: Description
- **Path**: URL path to property page
- **ImagePath**: Property image URL
- **County**: Location county
- **Region**: Geographic region
- **Latitude/Longitude**: GPS coordinates
- **HasValidLatLong**: Boolean for valid coordinates
- **IsFreeEntry**: Boolean for free/paid entry
- **IsTopHeritageSite**: Boolean for featured sites
- **PrimaryPropertyType**: Numeric type code
- **SelectedPropertyTypeList**: Array of property type IDs
- **SelectedFacilityList**: Array of facility IDs

## Property Types Observed
- Type 1: Abbey/Religious sites
- Type 2: Castles
- Type 4: Houses/Museums
- Type 7: Roman sites

## Facility IDs Observed
- 172, 173, 174, 175, 177 (need to map these to actual facility names)

## Sample Properties
1. 1066 Battle of Hastings - Paid entry, Top heritage site
2. Abbotsbury Abbey Remains - Free entry
3. Acton Burnell Castle - Free entry
4. Apsley House - Paid entry, Top heritage site



## Available Filters

### Entry Type
- **Most popular**: Featured/top heritage sites (IsTopHeritageSite)
- **Free to enter**: Free entry properties (IsFreeEntry = true)

### Facilities
- Cafe/Restaurant
- Dog friendly
- Family favourites
- Picnic seating
- Play area
- Wheelchair access

### Types of Place
- Abbeys and churches
- Castles and forts
- Gardens
- Houses and palaces
- Medieval and tudor
- Prehistoric
- Roman

## Filter Mapping Strategy
- Use IsFreeEntry boolean for free/paid filter
- Use IsTopHeritageSite boolean for most popular filter
- Map facility names to SelectedFacilityList IDs (need to reverse engineer)
- Map property types to SelectedPropertyTypeList and PrimaryPropertyType IDs
- Use coordinates for map display with MapLibre GL JS
- Use OpenFreeMap tiles (or compatible alternative)

