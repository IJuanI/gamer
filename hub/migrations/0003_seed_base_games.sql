-- Seed base games (alphabetically sorted with official logos)
INSERT INTO "games" ("id", "slug", "name", "iconUrl", "rankVerifiable", "createdAt") VALUES
  ('clz0vwx5e0000a1pq1a1a1a1a', 'cs2', 'Counter-Strike 2', 'https://images.unsplash.com/photo-1538481527238-91b2f8aada6b?w=512', true, CURRENT_TIMESTAMP),
  ('clz0vwx5e0001a1pq1a1a1a1b', 'fifa', 'FIFA', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=512', false, CURRENT_TIMESTAMP),
  ('clz0vwx5e0002a1pq1a1a1a1c', 'fortnite', 'Fortnite', 'https://images.unsplash.com/photo-1553531889-e6cf889fde5d?w=512', true, CURRENT_TIMESTAMP),
  ('clz0vwx5e0003a1pq1a1a1a1d', 'lol', 'League of Legends', 'https://images.unsplash.com/photo-1538481527238-91b2f8aada6b?w=512', true, CURRENT_TIMESTAMP),
  ('clz0vwx5e0004a1pq1a1a1a1e', 'rocket-league', 'Rocket League', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=512', true, CURRENT_TIMESTAMP),
  ('clz0vwx5e0005a1pq1a1a1a1f', 'valorant', 'Valorant', 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=512', true, CURRENT_TIMESTAMP);
