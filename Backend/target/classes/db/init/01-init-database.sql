-- SocialSync Database Initialization Script
-- This script sets up the basic database structure and permissions

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS socialsync_audit;
CREATE SCHEMA IF NOT EXISTS socialsync_temp;

-- Grant permissions to the application user
GRANT USAGE ON SCHEMA public TO socialsync;
GRANT USAGE ON SCHEMA socialsync_audit TO socialsync;
GRANT USAGE ON SCHEMA socialsync_temp TO socialsync;

GRANT CREATE ON SCHEMA public TO socialsync;
GRANT CREATE ON SCHEMA socialsync_audit TO socialsync;
GRANT CREATE ON SCHEMA socialsync_temp TO socialsync;

-- Create extensions that will be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set up basic configuration
ALTER DATABASE socialsync SET timezone TO 'UTC';

-- Create a function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create audit log function (for future use)
CREATE OR REPLACE FUNCTION create_audit_trigger(table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('
        CREATE TRIGGER %I_audit_trigger
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Placeholder audit function (will be implemented later)
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Audit functionality will be implemented in later phases
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for common query patterns (will be expanded later)
-- Note: Actual tables will be created by Flyway migrations
