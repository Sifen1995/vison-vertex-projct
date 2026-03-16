-- migrate:up
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_product
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE SET NULL
);

-- migrate:down
DROP TABLE IF EXISTS order_items ;

