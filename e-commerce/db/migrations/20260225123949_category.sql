-- migrate:up

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO categories (name) VALUES ('food'), ('utensils'), ('cloth');
-- migrate:down
DROP TABLE IF EXISTS categories;


