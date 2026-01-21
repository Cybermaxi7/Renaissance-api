-- Renaissance API Database Setup Script
-- This script creates the database and sets up the initial schema

-- Create database (if it doesn't exist)
-- Note: This might need to be run with superuser privileges
-- CREATE DATABASE renaissance_api;

-- Connect to the database
-- \c renaissance_api;

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- These will be automatically created by TypeORM, but listed here for reference

-- Users table indexes
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Posts table indexes
-- CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
-- CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
-- CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
-- CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
-- CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
-- CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Comments table indexes
-- CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
-- CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
-- CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
-- CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- Categories table indexes
-- CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
-- CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
-- CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- Media table indexes
-- CREATE INDEX IF NOT EXISTS idx_media_uploaded_by_id ON media(uploaded_by_id);
-- CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
-- CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);

-- Junction table indexes
-- CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
-- CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
-- These will be managed by TypeORM, but listed here for reference

-- Sample data insertion (optional - for development)
-- This section can be uncommented for initial development data

-- Insert sample admin user
-- INSERT INTO users (id, email, password, first_name, last_name, username, role, status, email_verified, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@renaissance.com',
--     '$2b$10$example.hash.here', -- This should be a proper bcrypt hash
--     'Admin',
--     'User',
--     'admin',
--     'admin',
--     'active',
--     true,
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- );

-- Insert sample categories
-- INSERT INTO categories (id, name, slug, description, status, sort_order, created_at, updated_at)
-- VALUES 
--     (uuid_generate_v4(), 'Technology', 'technology', 'All things tech', 'active', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--     (uuid_generate_v4(), 'Design', 'design', 'Design and creativity', 'active', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--     (uuid_generate_v4(), 'Business', 'business', 'Business and entrepreneurship', 'active', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO renaissance_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO renaissance_user;

-- Database setup complete
-- Run this script once to initialize the database structure
-- TypeORM will handle the actual table creation through migrations
