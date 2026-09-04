-- ============================================
-- MADFAM ECOSYSTEM - Database Initialization
-- ============================================
-- This script runs on first PostgreSQL startup to create
-- all application databases and users.
--
-- Run by: docker-compose.shared.yml (via docker-entrypoint-initdb.d)
-- Connection: postgres://madfam:madfam_dev_password@localhost:5432

-- ============================================
-- Layer 1: The Soil (Infrastructure)
-- ============================================

-- Janua - Authentication Platform (Port Block: 4100-4199)
CREATE USER janua WITH PASSWORD 'janua_dev';
CREATE DATABASE janua_dev OWNER janua;
GRANT ALL PRIVILEGES ON DATABASE janua_dev TO janua;

-- Enclii - DevOps Platform (Port Block: 4200-4299)
CREATE USER enclii WITH PASSWORD 'enclii_dev';
CREATE DATABASE enclii_dev OWNER enclii;
GRANT ALL PRIVILEGES ON DATABASE enclii_dev TO enclii;

-- ============================================
-- Layer 2: The Roots (Sensing & Input)
-- ============================================

-- Fortuna - Problem Intelligence (Port Block: 4300-4399)
CREATE USER fortuna WITH PASSWORD 'fortuna_dev';
CREATE DATABASE fortuna_dev OWNER fortuna;
GRANT ALL PRIVILEGES ON DATABASE fortuna_dev TO fortuna;

-- Forgesight - Manufacturing Intelligence (Port Block: 4400-4499)
CREATE USER forgesight WITH PASSWORD 'forgesight_dev';
CREATE DATABASE forgesight_dev OWNER forgesight;
GRANT ALL PRIVILEGES ON DATABASE forgesight_dev TO forgesight;

-- ============================================
-- Layer 3: The Stem (Core Standards)
-- ============================================

-- Cotiza - Quoting Engine (Port Block: 4500-4599)
CREATE USER cotiza WITH PASSWORD 'cotiza_dev';
CREATE DATABASE cotiza_dev OWNER cotiza;
GRANT ALL PRIVILEGES ON DATABASE cotiza_dev TO cotiza;

-- AVALA - Learning Verification (Port Block: 4600-4699)
CREATE USER avala WITH PASSWORD 'avala_dev';
CREATE DATABASE avala_dev OWNER avala;
GRANT ALL PRIVILEGES ON DATABASE avala_dev TO avala;

-- ============================================
-- Layer 4: The Fruit (User Platforms)
-- ============================================

-- Dhanam - Budget Tracking (Port Block: 4700-4799)
CREATE USER dhanam WITH PASSWORD 'dhanam_dev';
CREATE DATABASE dhanam_dev OWNER dhanam;
GRANT ALL PRIVILEGES ON DATABASE dhanam_dev TO dhanam;

-- Sim4D - CAD Platform (Port Block: 4800-4899)
CREATE USER sim4d WITH PASSWORD 'sim4d_dev';
CREATE DATABASE sim4d_dev OWNER sim4d;
GRANT ALL PRIVILEGES ON DATABASE sim4d_dev TO sim4d;

-- Forj - Fabrication (Port Block: 4900-4999)
CREATE USER forj WITH PASSWORD 'forj_dev';
CREATE DATABASE forj_dev OWNER forj;
GRANT ALL PRIVILEGES ON DATABASE forj_dev TO forj;

-- ============================================
-- Grant schema permissions for all databases
-- ============================================
\c janua_dev
GRANT ALL ON SCHEMA public TO janua;

\c enclii_dev
GRANT ALL ON SCHEMA public TO enclii;

\c avala_dev
GRANT ALL ON SCHEMA public TO avala;

\c forgesight_dev
GRANT ALL ON SCHEMA public TO forgesight;

\c fortuna_dev
GRANT ALL ON SCHEMA public TO fortuna;

\c cotiza_dev
GRANT ALL ON SCHEMA public TO cotiza;

\c dhanam_dev
GRANT ALL ON SCHEMA public TO dhanam;

\c sim4d_dev
GRANT ALL ON SCHEMA public TO sim4d;

\c forj_dev
GRANT ALL ON SCHEMA public TO forj;

-- ============================================
-- Summary
-- ============================================
\echo ''
\echo '============================================'
\echo 'MADFAM Database Initialization Complete'
\echo '============================================'
\echo 'Databases created:'
\echo '  janua_dev             (janua:janua_dev)'
\echo '  enclii_dev            (enclii:enclii_dev)'
\echo '  forgesight_dev        (forgesight:forgesight_dev)'
\echo '  fortuna_dev           (fortuna:fortuna_dev)'
\echo '  cotiza_dev            (cotiza:cotiza_dev)'
\echo '  avala_dev             (avala:avala_dev)'
\echo '  dhanam_dev            (dhanam:dhanam_dev)'
\echo '  sim4d_dev             (sim4d:sim4d_dev)'
\echo '  forj_dev              (forj:forj_dev)'
\echo '============================================'
