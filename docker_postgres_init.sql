CREATE USER work_time_settings WITH PASSWORD 'work_time_settings' CREATEDB;
CREATE DATABASE work_time_settings
    WITH
    OWNER = work_time_settings
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;