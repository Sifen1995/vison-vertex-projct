-- migrate:up
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token TEXT NOT NULL, -- Changed to TEXT because JWTs/Tokens can be long
    expires_at TIMESTAMPTZ NOT NULL, -- Correct Postgres type
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Keep this only if you want ONE session per user. 
    -- Otherwise, delete this line:
    UNIQUE (user_id) 
);

-- migrate:up
ALTER TABLE refresh_tokens 
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Ensure your constraint is named correctly for the UPSERT logic
-- (Usually, GORM/Postgres names it "refresh_tokens_user_id_key")

-- migrate:down
DROP TABLE IF EXISTS refresh_tokens;





