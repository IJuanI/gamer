-- Seed admin, editor, and member users
-- Passwords: admin1234, editor1234, member1234 (bcrypt hashed with salt 12)

INSERT INTO users (id, email, displayName, passwordHash, role, createdAt, updatedAt) VALUES
  ('admin-user-001', 'admin@local', 'Admin GamER', '$2a$12$5d3eKpCkY1eLxmSdFZJ6v.hZkXWLaEVUQZQiQxqZVPYQ6tUhqfqGO', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('editor-user-001', 'editor@local', 'Editor GamER', '$2a$12$yxJBKVQ2k7.7FaHYmjSuD.7YZRkUF3ydBfQEZxWfx8P3KYqvZzH1K', 'EDITOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('member-user-001', 'member@local', 'Miembro GamER', '$2a$12$aH4fZdY.7K7Nj9t5Xq2FeubM8Ks5gZdWqP3mL6xRsYj8VhW5B4V6a', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
