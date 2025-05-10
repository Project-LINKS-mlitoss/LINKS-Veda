-- Update existing use cases based on their current names.
UPDATE use_cases SET name = 'UC12' WHERE name = 'UC1';
UPDATE use_cases SET name = 'UC13' WHERE name = 'UC2';
UPDATE use_cases SET name = 'UC14' WHERE name = 'UC3';

-- Add new Use Cases only if they don't exist.
INSERT IGNORE INTO use_cases (name, created_at, updated_at)
VALUES
  ('UC15', NOW(), NOW()),
  ('UC16', NOW(), NOW()),
  ('UC17', NOW(), NOW()),
  ('UC19', NOW(), NOW()),
  ('UC20', NOW(), NOW());
