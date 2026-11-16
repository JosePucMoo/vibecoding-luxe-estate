-- Add images jsonb array column to public.properties and populate from public.property_images
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.properties p
SET images = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object('url', pi.url, 'alt', pi.alt)
      ORDER BY pi.sort_order ASC
    )
    FROM public.property_images pi
    WHERE pi.property_id = p.id
  ),
  '[]'::jsonb
);
