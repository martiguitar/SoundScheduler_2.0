ALTER TABLE sounds
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS sounds_display_order_idx ON sounds(display_order);