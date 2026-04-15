CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём единственного пользователя-админа (пароль захеширован bcrypt, исходный "admin123")
INSERT INTO users (username, password_hash) VALUES 
('artem', '$2b$10$wZ9xL8yV1pR4eW7tY6u0AeB3fG5hJ7kL9mN2pQ4rS6vU8wX0zY2aC');