INSERT INTO demo_seed_items (code, label)
VALUES
  ('sample-1', 'Sample Item 1'),
  ('sample-2', 'Sample Item 2'),
  ('sample-3', 'Sample Item 3')
ON CONFLICT (code) DO UPDATE
SET
  label = EXCLUDED.label,
  updated_at = NOW();
