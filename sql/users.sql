DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL CHECK (first <>''),
    last VARCHAR(200) NOT NULL CHECK (last <>''),
    email VARCHAR(200) UNIQUE NOT NULL CHECK (email <>''),
    hashedpass VARCHAR(200) NOT NULL CHECK (hashedpass <>''),
    img_url VARCHAR (300),
    bio VARCHAR (255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS password_reset_codes;

CREATE TABLE password_reset_codes
(
    id SERIAL PRIMARY KEY,
    email VARCHAR(200) NOT NULL CHECK (email <>''),
    code VARCHAR(6) NOT NULL CHECK (code <>''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS friendships;

CREATE TABLE friendships
(
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) NOT NULL,
  receiver_id INT REFERENCES users(id) NOT NULL,
  accepted BOOLEAN DEFAULT false
);

DROP TABLE IF EXISTS messages;

CREATE TABLE messages
(
    id SERIAL PRIMARY KEY,
    msg TEXT NOT NULL CHECK (msg != ''),
    user_id INT REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS wall_posts; 

CREATE TABLE wall_posts
(
    id SERIAL PRIMARY KEY,
    post TEXT NOT NULL CHECK (post != ''),
    user_id INT REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)