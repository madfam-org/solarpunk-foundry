-- Platform Database Initialization
-- Creates separate databases for each service with dedicated users

-- Janua (Authentication)
CREATE USER janua WITH PASSWORD 'janua_dev';
CREATE DATABASE janua_dev OWNER janua;
GRANT ALL PRIVILEGES ON DATABASE janua_dev TO janua;

-- Enclii (PaaS)
CREATE USER enclii WITH PASSWORD 'enclii_dev';
CREATE DATABASE enclii_dev OWNER enclii;
GRANT ALL PRIVILEGES ON DATABASE enclii_dev TO enclii;

-- Avala (LMS)
CREATE USER avala WITH PASSWORD 'avala_dev' CREATEDB;
CREATE DATABASE avala_dev OWNER avala;
GRANT ALL PRIVILEGES ON DATABASE avala_dev TO avala;

-- Grant schema permissions
\c janua_dev
GRANT ALL ON SCHEMA public TO janua;

\c enclii_dev
GRANT ALL ON SCHEMA public TO enclii;

\c avala_dev
GRANT ALL ON SCHEMA public TO avala;
