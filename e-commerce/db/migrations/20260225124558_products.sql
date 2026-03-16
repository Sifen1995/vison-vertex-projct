-- migrate:up


CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- This is your incrementing column (stock/count)
    count INTEGER NOT NULL DEFAULT 1, 
    
    -- Foreign Keys
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    
    -- Audit Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    

    CONSTRAINT fk_category
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE RESTRICT, -- Prevents deleting a category if it has products

    CONSTRAINT fk_user_product
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,

    -- This UNIQUE constraint is REQUIRED for the increment logic to work safely
    -- It ensures a user can't have two separate rows for the same product name
    UNIQUE (user_id, name)
);

-- migrate:down
DROP TABLE IF EXISTS products;


