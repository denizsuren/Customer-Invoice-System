CREATE TABLE IF NOT EXISTS admin_session (
    token      VARCHAR(36) PRIMARY KEY,
    admin_id   BIGINT NOT NULL REFERENCES administrator(admin_id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    expires_at TIMESTAMP NOT NULL
);