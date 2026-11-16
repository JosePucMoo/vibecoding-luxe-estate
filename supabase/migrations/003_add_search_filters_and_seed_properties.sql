-- 1. Add property_type and price_value columns to public.properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS property_type text NOT NULL DEFAULT 'House',
ADD COLUMN IF NOT EXISTS price_value numeric NOT NULL DEFAULT 0;

-- Add check constraint for property_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_property_type_check'
  ) THEN
    ALTER TABLE public.properties
    ADD CONSTRAINT properties_property_type_check
    CHECK (property_type = ANY (ARRAY['House'::text, 'Apartment'::text, 'Villa'::text, 'Penthouse'::text, 'Condo'::text, 'Townhouse'::text]));
  END IF;
END $$;

-- 2. Create indexes for fast filtering and sorting
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS properties_price_value_idx ON public.properties (price_value);
CREATE INDEX IF NOT EXISTS properties_beds_idx ON public.properties (beds);
CREATE INDEX IF NOT EXISTS properties_baths_idx ON public.properties (baths);
CREATE INDEX IF NOT EXISTS properties_listing_type_idx ON public.properties (listing_type);
CREATE INDEX IF NOT EXISTS properties_amenities_gin_idx ON public.properties USING gin (amenities);

-- 3. Update existing 19 properties with accurate price_value, property_type, and varied amenities
UPDATE public.properties SET
  price_value = 5250000,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Smart Home System', 'Wine Cellar']
WHERE id = 'glass-pavilion';

UPDATE public.properties SET
  price_value = 3800000,
  property_type = 'Penthouse',
  amenities = ARRAY['Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Smart Home System']
WHERE id = 'azure-heights';

UPDATE public.properties SET
  price_value = 1250000,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Smart Home System']
WHERE id = 'serenity-lane-palo-alto';

UPDATE public.properties SET
  price_value = 850000,
  property_type = 'House',
  amenities = ARRAY['Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'modern-family-home';

UPDATE public.properties SET
  price_value = 3200,
  property_type = 'Apartment',
  amenities = ARRAY['Gym', 'Air Conditioning', 'High-speed Wifi']
WHERE id = 'urban-loft';

UPDATE public.properties SET
  price_value = 620000,
  property_type = 'House',
  amenities = ARRAY['Parking', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'highland-retreat';

UPDATE public.properties SET
  price_value = 4500,
  property_type = 'Penthouse',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'sea-view-penthouse';

UPDATE public.properties SET
  price_value = 550000,
  property_type = 'Apartment',
  amenities = ARRAY['Gym', 'Air Conditioning', 'High-speed Wifi']
WHERE id = 'central-studio';

UPDATE public.properties SET
  price_value = 2800,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'garden-villa';

UPDATE public.properties SET
  price_value = 4200000,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Wine Cellar']
WHERE id = 'bel-air-sanctuary';

UPDATE public.properties SET
  price_value = 7500,
  property_type = 'Penthouse',
  amenities = ARRAY['Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'skyline-duplex';

UPDATE public.properties SET
  price_value = 2950000,
  property_type = 'House',
  amenities = ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'solarium-residence';

UPDATE public.properties SET
  price_value = 5800,
  property_type = 'Apartment',
  amenities = ARRAY['Gym', 'Air Conditioning', 'High-speed Wifi']
WHERE id = 'tribeca-loft';

UPDATE public.properties SET
  price_value = 3450000,
  property_type = 'House',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'aspen-woodland-chalet';

UPDATE public.properties SET
  price_value = 3900,
  property_type = 'Condo',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi']
WHERE id = 'monaco-bay-terrace';

UPDATE public.properties SET
  price_value = 1890000,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'desert-mirage-villa';

UPDATE public.properties SET
  price_value = 3100,
  property_type = 'Apartment',
  amenities = ARRAY['Air Conditioning', 'High-speed Wifi']
WHERE id = 'nordic-minimalist-flat';

UPDATE public.properties SET
  price_value = 4850000,
  property_type = 'Villa',
  amenities = ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Wine Cellar']
WHERE id = 'emerald-valley-estate';

UPDATE public.properties SET
  price_value = 6200,
  property_type = 'Penthouse',
  amenities = ARRAY['Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace']
WHERE id = 'hazelwood-penthouse';

-- 4. Insert 20 additional realistic placeholder properties
INSERT INTO public.properties (
  id, slug, title, location, price, price_value, period, listing_type, property_type,
  beds, baths, area, garage, description, amenities, badges, is_featured, featured_badge,
  latitude, longitude, agent_name, agent_role, agent_image, estimated_payment, is_favorite, sort_order, images
) VALUES
(
  'pacific-heights-manor',
  'pacific-heights-manor',
  'Pacific Heights Victorian Manor',
  '2480 Broadway St, San Francisco, CA',
  '$4,150,000',
  4150000,
  NULL,
  'FOR SALE',
  'House',
  5,
  4.5,
  '390m²',
  2,
  ARRAY[
    'Perched on one of Pacific Heights most coveted blocks, this restored residence blends timeless architectural detailing with bespoke contemporary interiors.',
    'Enjoy sweeping views of the Golden Gate Bridge, a landscaped south-facing garden terrace, and a chef-grade kitchen crafted with Calacatta marble.'
  ],
  ARRAY['Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace', 'Gym'],
  ARRAY['Premium', 'Historic'],
  false,
  NULL,
  37.7925,
  -122.4382,
  'Elena Rostova',
  'Senior Luxury Advisor',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '$18,900/mo',
  false,
  17,
  '[
    {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "alt": "Pacific Heights Victorian Manor Exterior"},
    {"url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", "alt": "Formal Living Room"},
    {"url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", "alt": "Chef Kitchen"}
  ]'::jsonb
),
(
  'soma-skyline-condo',
  'soma-skyline-condo',
  'SoMa Skyline Glass Condo',
  '301 Mission St, San Francisco, CA',
  '$1,650,000',
  1650000,
  NULL,
  'FOR SALE',
  'Condo',
  2,
  2.0,
  '140m²',
  1,
  ARRAY[
    'Floor-to-ceiling insulated glass walls frame panoramic downtown San Francisco and Bay Bridge vistas from this sleek high-rise residence.',
    'Residents enjoy 24-hour concierge service, a lap pool, private fitness studio, and direct access to Salesforce Park.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi'],
  ARRAY['Modern', 'View'],
  false,
  NULL,
  37.7909,
  -122.3965,
  'Marcus Vance',
  'Urban Living Specialist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  '$7,450/mo',
  false,
  18,
  '[
    {"url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "alt": "SoMa Skyline Glass Condo"},
    {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "alt": "Open Concept Lounge"}
  ]'::jsonb
),
(
  'marina-bay-townhouse',
  'marina-bay-townhouse',
  'Marina District Sunlit Townhouse',
  '1840 Chestnut St, San Francisco, CA',
  '$2,750,000',
  2750000,
  NULL,
  'FOR SALE',
  'Townhouse',
  3,
  2.5,
  '215m²',
  2,
  ARRAY[
    'Steps from Marina Green and Crissy Field, this three-level contemporary townhouse offers effortless indoor-outdoor California living.',
    'Features a private rooftop deck with fire pit, radiant floor heating, and a two-car side-by-side garage.'
  ],
  ARRAY['Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['New', 'Prime Location'],
  false,
  NULL,
  37.8006,
  -122.4338,
  'Sarah Jenkins',
  'Top Rated Agent',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
  '$12,300/mo',
  false,
  19,
  '[
    {"url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", "alt": "Marina District Townhouse"},
    {"url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80", "alt": "Townhouse Terrace"}
  ]'::jsonb
),
(
  'coconut-grove-oasis',
  'coconut-grove-oasis',
  'Coconut Grove Tropical Villa',
  '3420 Main Hwy, Miami, FL',
  '$3,600,000',
  3600000,
  NULL,
  'FOR SALE',
  'Villa',
  4,
  4.5,
  '365m²',
  3,
  ARRAY[
    'Tucked behind lush tropical foliage in Coconut Grove, this architectural sanctuary centers around a saltwater infinity pool and summer kitchen.',
    'Crafted with natural coral stone, Burmese teak accents, and hurricane-impact floor-to-ceiling sliders.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Exclusive', 'Resort Style'],
  false,
  NULL,
  25.7270,
  -80.2414,
  'Mateo Silva',
  'South Florida Director',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '$16,100/mo',
  false,
  20,
  '[
    {"url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80", "alt": "Coconut Grove Villa Pool"},
    {"url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80", "alt": "Tropical Villa Interior"}
  ]'::jsonb
),
(
  'brickell-sky-penthouse',
  'brickell-sky-penthouse',
  'Brickell Key Sky Penthouse',
  '888 Brickell Key Dr, Miami, FL',
  '$8,900',
  8900,
  '/mo',
  'FOR RENT',
  'Penthouse',
  3,
  3.5,
  '230m²',
  2,
  ARRAY[
    'Soaring 48 stories above Biscayne Bay, this turnkey corner penthouse delivers unobstructed sunrise and sunset water views.',
    'Includes private elevator foyer, wraparound glass balcony, Italian cabinetry, and resort-style building amenities.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Waterfront', 'Luxury Rent'],
  false,
  NULL,
  25.7663,
  -80.1856,
  'Mateo Silva',
  'South Florida Director',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '$8,900/mo',
  false,
  21,
  '[
    {"url": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80", "alt": "Brickell Sky Penthouse"},
    {"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", "alt": "Penthouse Living Area"}
  ]'::jsonb
),
(
  'west-village-brownstone',
  'west-village-brownstone',
  'West Village Historic Townhouse',
  '214 W 11th St, New York, NY',
  '$6,400,000',
  6400000,
  NULL,
  'FOR SALE',
  'Townhouse',
  5,
  5.0,
  '410m²',
  1,
  ARRAY[
    'A rare 22-foot-wide Greek Revival townhouse on a tree-lined West Village cobblestone block, reimagined by an acclaimed AD100 studio.',
    'Boasts a landscaped bluestone garden, five wood-burning fireplaces, a temperature-controlled wine room, and a sunlit parlor floor.'
  ],
  ARRAY['Gym', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Landmark', 'Exclusive'],
  false,
  NULL,
  40.7359,
  -74.0036,
  'Claire Beaumont',
  'Manhattan Private Client Partner',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  '$28,700/mo',
  false,
  22,
  '[
    {"url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80", "alt": "West Village Townhouse"},
    {"url": "https://images.unsplash.com/photo-1600573472589-003525b2b729?auto=format&fit=crop&w=1200&q=80", "alt": "Parlor Floor Dining"}
  ]'::jsonb
),
(
  'chelsea-gallery-condo',
  'chelsea-gallery-condo',
  'High Line Architectural Condo',
  '520 W 28th St, New York, NY',
  '$2,350,000',
  2350000,
  NULL,
  'FOR SALE',
  'Condo',
  2,
  2.5,
  '155m²',
  1,
  ARRAY[
    'Directly overlooking the High Line in West Chelsea, this sculptural residence features curved floor-to-ceiling windows and custom Boffi millwork.',
    'Includes automated Lutron shading, private storage, indoor skylight swimming pool, and wellness spa.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi'],
  ARRAY['Architectural', 'New'],
  false,
  NULL,
  40.7512,
  -74.0028,
  'Claire Beaumont',
  'Manhattan Private Client Partner',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  '$10,500/mo',
  false,
  23,
  '[
    {"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80", "alt": "Chelsea Gallery Condo"},
    {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", "alt": "Chelsea Condo Interior"}
  ]'::jsonb
),
(
  'hollywood-hills-cantilever',
  'hollywood-hills-cantilever',
  'Bird Streets Cantilever Villa',
  '9210 Nightingale Dr, Los Angeles, CA',
  '$5,750,000',
  5750000,
  NULL,
  'FOR SALE',
  'Villa',
  4,
  5.0,
  '440m²',
  3,
  ARRAY[
    'Commanding jetliner views from Downtown Los Angeles to the Pacific Ocean, this warm-minimalist villa is designed for seamless entertaining.',
    'Zero-edge infinity pool, sunken fire lounge, home theater, and primary suite with private travertine spa terrace.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Jetliner Views', 'Premium'],
  false,
  NULL,
  34.0983,
  -118.3935,
  'Sarah Jenkins',
  'Top Rated Agent',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
  '$25,800/mo',
  false,
  24,
  '[
    {"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "alt": "Bird Streets Cantilever Villa"},
    {"url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80", "alt": "Infinity Pool Deck"}
  ]'::jsonb
),
(
  'santa-monica-canyon-house',
  'santa-monica-canyon-house',
  'Santa Monica Canyon Cedar Home',
  '412 E Channel Rd, Santa Monica, CA',
  '$3,150,000',
  3150000,
  NULL,
  'FOR SALE',
  'House',
  4,
  3.5,
  '295m²',
  2,
  ARRAY[
    'Moments from the beach in Santa Monica Canyon, this organic modern home pairs western red cedar siding with board-formed concrete.',
    'Sun-drenched courtyard with plunge pool, outdoor shower, and mature olive trees.'
  ],
  ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Coastal', 'Organic Modern'],
  false,
  NULL,
  34.0289,
  -118.5162,
  'Elena Rostova',
  'Senior Luxury Advisor',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '$14,100/mo',
  false,
  25,
  '[
    {"url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", "alt": "Santa Monica Canyon Home"},
    {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "alt": "Sunlit Courtyard"}
  ]'::jsonb
),
(
  'lake-austin-waterfront',
  'lake-austin-waterfront',
  'Westlake Hills Waterfront Villa',
  '1904 Scenic Dr, Austin, TX',
  '$2,490,000',
  2490000,
  NULL,
  'FOR SALE',
  'Villa',
  4,
  4.0,
  '340m²',
  3,
  ARRAY[
    'Set along the tranquil shores of Lake Austin, this limestone and steel villa includes a private two-slip boat dock and lakeside cabana.',
    'Vaulted white-oak ceilings, screened outdoor living room, and resort pool.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Waterfront', 'Private Dock'],
  false,
  NULL,
  30.2972,
  -97.7831,
  'Marcus Vance',
  'Urban Living Specialist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  '$11,200/mo',
  false,
  26,
  '[
    {"url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80", "alt": "Westlake Hills Villa"},
    {"url": "https://images.unsplash.com/photo-1600566753086-2d87185b9fd2?auto=format&fit=crop&w=1200&q=80", "alt": "Lake View Terrace"}
  ]'::jsonb
),
(
  'gold-coast-terrace-penthouse',
  'gold-coast-terrace-penthouse',
  'Gold Coast Lakefront Penthouse',
  '1200 N Lake Shore Dr, Chicago, IL',
  '$1,980,000',
  1980000,
  NULL,
  'FOR SALE',
  'Penthouse',
  3,
  3.0,
  '250m²',
  2,
  ARRAY[
    'Commanding direct views of Lake Michigan and Oak Street Beach, this Gold Coast penthouse combines classic proportions with modern refinement.',
    'Includes a 600-square-foot landscaped terrace, private fitness suite access, and valet garage parking.'
  ],
  ARRAY['Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Lakefront', 'Premium'],
  false,
  NULL,
  41.9039,
  -87.6251,
  'Claire Beaumont',
  'Manhattan Private Client Partner',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  '$8,950/mo',
  false,
  27,
  '[
    {"url": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80", "alt": "Gold Coast Penthouse"},
    {"url": "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80", "alt": "Lakefront Living Room"}
  ]'::jsonb
),
(
  'scottsdale-desert-reserve',
  'scottsdale-desert-reserve',
  'Silverleaf Desert Contemporary',
  '10450 E Robs Camp Rd, Scottsdale, AZ',
  '$3,300,000',
  3300000,
  NULL,
  'FOR SALE',
  'Villa',
  4,
  4.5,
  '395m²',
  3,
  ARRAY[
    'Nestled into the McDowell Mountains in Silverleaf, this desert contemporary residence harmonizes rammed-earth walls with expansive glass.',
    'Negative-edge lap pool, misted loggia, outdoor pizza oven, and private wellness gym.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Golf Community', 'Desert Luxury'],
  false,
  NULL,
  33.6744,
  -111.8601,
  'Elena Rostova',
  'Senior Luxury Advisor',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '$14,800/mo',
  false,
  28,
  '[
    {"url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80", "alt": "Silverleaf Desert Villa"},
    {"url": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80", "alt": "Desert Pool Lounge"}
  ]'::jsonb
),
(
  'la-jolla-ocean-bluff',
  'la-jolla-ocean-bluff',
  'La Jolla Muirlands Ocean House',
  '6280 Camino De La Costa, San Diego, CA',
  '$4,600,000',
  4600000,
  NULL,
  'FOR SALE',
  'House',
  5,
  5.0,
  '420m²',
  3,
  ARRAY[
    'Overlooking the dramatic coastline of La Jolla, this coastal sanctuary captures whitewater surf views and year-round sea breezes.',
    'Features a heated mosaic pool, detached guest casita, solar energy system, and disappearing pocket doors.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Ocean View', 'Exclusive'],
  false,
  NULL,
  32.8282,
  -117.2741,
  'Sarah Jenkins',
  'Top Rated Agent',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
  '$20,600/mo',
  false,
  29,
  '[
    {"url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80", "alt": "La Jolla Ocean House"},
    {"url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", "alt": "Oceanfront Deck"}
  ]'::jsonb
),
(
  'queen-anne-view-townhouse',
  'queen-anne-view-townhouse',
  'Queen Anne Sound View Townhouse',
  '1420 8th Ave W, Seattle, WA',
  '$1,180,000',
  1180000,
  NULL,
  'FOR SALE',
  'Townhouse',
  3,
  2.5,
  '175m²',
  1,
  ARRAY[
    'Positioned on the south slope of Queen Anne, this Nordic-inspired townhouse enjoys views of Puget Sound and the Olympic Mountains.',
    'Includes a private rooftop deck, custom white-oak cabinetry, and EV-ready garage.'
  ],
  ARRAY['Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Mountain View', 'Eco-Friendly'],
  false,
  NULL,
  47.6322,
  -122.3679,
  'Marcus Vance',
  'Urban Living Specialist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  '$5,300/mo',
  false,
  30,
  '[
    {"url": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80", "alt": "Queen Anne Townhouse"},
    {"url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80", "alt": "Nordic Kitchen"}
  ]'::jsonb
),
(
  'back-bay-brownstone-condo',
  'back-bay-brownstone-condo',
  'Commonwealth Ave Parlor Condo',
  '290 Commonwealth Ave, Boston, MA',
  '$1,490,000',
  1490000,
  NULL,
  'FOR SALE',
  'Condo',
  2,
  2.0,
  '135m²',
  1,
  ARRAY[
    'Overlooking the Commonwealth Avenue Mall in Back Bay, this single-floor parlor residence boasts 12-foot ceilings and herringbone oak floors.',
    'Direct deeded parking space, marble gas fireplace, and private walk-out deck.'
  ],
  ARRAY['Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Historic', 'Back Bay'],
  false,
  NULL,
  42.3505,
  -71.0845,
  'Claire Beaumont',
  'Manhattan Private Client Partner',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  '$6,700/mo',
  false,
  31,
  '[
    {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "alt": "Back Bay Parlor Condo"},
    {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", "alt": "Parlor Living Room"}
  ]'::jsonb
),
(
  'charleston-battery-carriage',
  'charleston-battery-carriage',
  'South of Broad Garden House',
  '48 Legare St, Charleston, SC',
  '$2,150,000',
  2150000,
  NULL,
  'FOR SALE',
  'House',
  4,
  3.5,
  '280m²',
  2,
  ARRAY[
    'In the heart of Historic Charleston South of Broad, this restored residence features double piazzas and a walled jasmine courtyard with heated plunge pool.',
    'Heart-pine flooring, high ceilings, and modernized climate and smart-home systems throughout.'
  ],
  ARRAY['Swimming Pool', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Historic', 'Garden Pool'],
  false,
  NULL,
  32.7732,
  -79.9344,
  'Mateo Silva',
  'South Florida Director',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '$9,650/mo',
  false,
  32,
  '[
    {"url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80", "alt": "South of Broad Garden House"},
    {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "alt": "Walled Courtyard"}
  ]'::jsonb
),
(
  'montecito-olive-grove-villa',
  'montecito-olive-grove-villa',
  'Montecito Olive Grove Villa',
  '780 Ashley Rd, Santa Barbara, CA',
  '$5,400,000',
  5400000,
  NULL,
  'FOR SALE',
  'Villa',
  5,
  5.5,
  '460m²',
  3,
  ARRAY[
    'Surrounded by century-old olive trees in Montecito Golden Quadrangle, this Mediterranean-modern estate offers complete privacy and mountain views.',
    'Resort-grade zero-edge pool, detached gym pavilion, bocce court, and outdoor stone fireplace.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Estate', 'Montecito'],
  false,
  NULL,
  34.4362,
  -119.6321,
  'Elena Rostova',
  'Senior Luxury Advisor',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '$24,200/mo',
  false,
  33,
  '[
    {"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "alt": "Montecito Olive Grove Villa"},
    {"url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", "alt": "Great Room"}
  ]'::jsonb
),
(
  'cherry-creek-modern-duplex',
  'cherry-creek-modern-duplex',
  'Cherry Creek North Modern Residence',
  '345 Fillmore St, Denver, CO',
  '$4,200',
  4200,
  '/mo',
  'FOR RENT',
  'Townhouse',
  3,
  3.0,
  '190m²',
  2,
  ARRAY[
    'Steps from Cherry Creek North boutiques and dining, this contemporary townhome features a private elevator and rooftop mountain-view lounge.',
    'Heated driveway, two-car garage, custom wine bar, and high-speed fiber connectivity.'
  ],
  ARRAY['Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Luxury Rent', 'Rooftop'],
  false,
  NULL,
  39.7214,
  -104.9532,
  'Marcus Vance',
  'Urban Living Specialist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  '$4,200/mo',
  false,
  34,
  '[
    {"url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80", "alt": "Cherry Creek Residence"},
    {"url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", "alt": "Modern Kitchen"}
  ]'::jsonb
),
(
  'kahala-oceanfront-lanai',
  'kahala-oceanfront-lanai',
  'Kahala Ave Oceanfront Condo',
  '4699 Kahala Ave, Honolulu, HI',
  '$6,800',
  6800,
  '/mo',
  'FOR RENT',
  'Condo',
  2,
  2.0,
  '150m²',
  2,
  ARRAY[
    'Wake up to turquoise Pacific views and trade winds in this serene Kahala residence featuring a deep covered lanai.',
    'Includes resort lagoon pool, fitness center, secure covered parking, and direct sandy beach access.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Beachfront', 'Tropical'],
  false,
  NULL,
  21.2649,
  -157.7824,
  'Elena Rostova',
  'Senior Luxury Advisor',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '$6,800/mo',
  false,
  35,
  '[
    {"url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "alt": "Kahala Oceanfront Condo"},
    {"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", "alt": "Ocean Lanai"}
  ]'::jsonb
),
(
  'tahoe-martis-camp-lodge',
  'tahoe-martis-camp-lodge',
  'Martis Camp Alpine Glass Lodge',
  '10820 Olana Dr, Truckee, CA',
  '$3,950,000',
  3950000,
  NULL,
  'FOR SALE',
  'House',
  4,
  4.5,
  '370m²',
  2,
  ARRAY[
    'Located in Lake Tahoe premier Martis Camp community, this mountain-modern lodge blends blackened steel, cedar, and Sierra granite.',
    'Features a heated outdoor spa terrace, ski locker room, private fitness studio, and panoramic Carson Range views.'
  ],
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Air Conditioning', 'High-speed Wifi', 'Patio / Terrace'],
  ARRAY['Mountain Modern', 'Ski Access'],
  false,
  NULL,
  39.2974,
  -120.1354,
  'Sarah Jenkins',
  'Top Rated Agent',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
  '$17,700/mo',
  false,
  36,
  '[
    {"url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", "alt": "Martis Camp Alpine Lodge"},
    {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "alt": "Alpine Great Room"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  price = EXCLUDED.price,
  price_value = EXCLUDED.price_value,
  period = EXCLUDED.period,
  listing_type = EXCLUDED.listing_type,
  property_type = EXCLUDED.property_type,
  beds = EXCLUDED.beds,
  baths = EXCLUDED.baths,
  area = EXCLUDED.area,
  garage = EXCLUDED.garage,
  description = EXCLUDED.description,
  amenities = EXCLUDED.amenities,
  badges = EXCLUDED.badges,
  is_featured = EXCLUDED.is_featured,
  featured_badge = EXCLUDED.featured_badge,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  agent_name = EXCLUDED.agent_name,
  agent_role = EXCLUDED.agent_role,
  agent_image = EXCLUDED.agent_image,
  estimated_payment = EXCLUDED.estimated_payment,
  is_favorite = EXCLUDED.is_favorite,
  sort_order = EXCLUDED.sort_order,
  images = EXCLUDED.images;
