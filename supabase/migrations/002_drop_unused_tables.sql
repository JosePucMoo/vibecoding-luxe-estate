-- Safety check: ensure all properties in public.properties have their images array populated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.properties WHERE jsonb_array_length(images) = 0
  ) THEN
    RAISE EXCEPTION 'Aborting drop: one or more properties in public.properties have an empty images array.';
  END IF;
END $$;

-- Drop unused relational and legacy tables
DROP TABLE IF EXISTS public.property_images;
DROP TABLE IF EXISTS public.featured_properties;
DROP TABLE IF EXISTS public.market_properties;
