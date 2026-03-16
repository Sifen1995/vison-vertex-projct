-- migrate:up

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_buyer
        FOREIGN KEY (buyer_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
);
    
-- migrate:down
DROP TABLE IF EXISTS orders ;
