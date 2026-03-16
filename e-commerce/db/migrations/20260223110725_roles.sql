-- migrate:up
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL -- 'admin', 'user'
);

-- migrate:down
DROP TABLE IF EXISTS roles;


