-- ============================================
-- MADFAM Shared PostgreSQL Database Initialization
-- ============================================
-- Creates separate databases for each application
-- All apps share the same PostgreSQL instance
-- but maintain data isolation through separate DBs
-- ============================================

-- Madfam Core Database (for shared/legacy references)
CREATE DATABASE madfam OWNER madfam;

-- Janua Authentication Platform
CREATE DATABASE janua_db OWNER madfam;

-- Cotiza Quoting Platform (digifab-quoting)
CREATE DATABASE cotiza_db OWNER madfam;

-- Forgesight Vendor Intelligence
CREATE DATABASE forgesight_db OWNER madfam;

-- Dhanam Financial Platform
CREATE DATABASE dhanam_db OWNER madfam;

-- AVALA Procurement Platform
CREATE DATABASE avala_db OWNER madfam;

-- Fortuna NLP Platform
CREATE DATABASE fortuna_db OWNER madfam;

-- Blueprint Harvester
CREATE DATABASE blueprint_db OWNER madfam;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE madfam TO madfam;
GRANT ALL PRIVILEGES ON DATABASE janua_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE cotiza_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE forgesight_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE dhanam_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE avala_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE fortuna_db TO madfam;
GRANT ALL PRIVILEGES ON DATABASE blueprint_db TO madfam;

-- Extensions for each database
\c madfam
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c janua_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c cotiza_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c forgesight_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c dhanam_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c avala_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c fortuna_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c blueprint_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
