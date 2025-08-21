-- Flyway baseline migration: schema and indices
-- NOTE: Uses PostgreSQL types and JSONB columns

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20),
    subscription_plan VARCHAR(20),
    preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status) WHERE deleted_at IS NULL;

-- SOCIAL ACCOUNTS
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id),
    platform VARCHAR(20) NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    profile_image_url VARCHAR(500),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    account_status VARCHAR(20),
    permissions JSONB,
    platform_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uk_user_platform_platformId UNIQUE (user_id, platform, platform_user_id)
);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(account_status);

-- POSTS
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    content TEXT,
    content_type VARCHAR(20),
    status VARCHAR(20),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    template_id UUID,
    media_files JSONB,
    hashtags JSONB,
    mentions JSONB,
    platform_settings JSONB,
    analytics_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_posts_user_status ON posts(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'SCHEDULED';
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- POST_PLATFORMS
CREATE TABLE IF NOT EXISTS post_platforms (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    post_id UUID NOT NULL REFERENCES posts(id),
    social_account_id UUID NOT NULL REFERENCES social_accounts(id),
    platform_post_id VARCHAR(255),
    platform_url VARCHAR(500),
    status VARCHAR(20),
    error_message TEXT,
    platform_specific_data JSONB,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uk_post_account UNIQUE (post_id, social_account_id)
);

-- ANALYTICS
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    post_platform_id UUID NOT NULL REFERENCES post_platforms(id),
    metric_type VARCHAR(50) NOT NULL,
    metric_value BIGINT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    platform_data TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_analytics_post_metric_time ON analytics(post_platform_id, metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at);

-- SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(20),
    recurrence_pattern JSONB,
    timezone VARCHAR(50) DEFAULT 'UTC',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    next_execution TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- MEDIA FILES
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_type VARCHAR(20),
    mime_type VARCHAR(100),
    file_size BIGINT,
    file_path VARCHAR(500),
    thumbnail_path VARCHAR(500),
    dimensions JSONB,
    duration INTEGER,
    metadata JSONB,
    tags JSONB,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_media_user_type ON media_files(user_id, file_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_created ON media_files(created_at DESC);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(20),
    category VARCHAR(100),
    template_data JSONB,
    preview_image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Seed data for development
INSERT INTO users (id, email, password_hash, first_name, last_name, account_status, subscription_plan, created_at)
VALUES (uuid_generate_v4(), 'dev@example.com', '$2a$10$devhash', 'Dev', 'User', 'ACTIVE', 'FREE', NOW())
ON CONFLICT DO NOTHING;

