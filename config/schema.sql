-- ============================================
-- PROJEXA V4 DATABASE SCHEMA
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    full_name VARCHAR(120) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password VARCHAR(255),

    google_id VARCHAR(255) UNIQUE,

    avatar TEXT,

    role VARCHAR(20) DEFAULT 'student',

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------

-- Projects Table

CREATE TABLE IF NOT EXISTS projects (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    category VARCHAR(100),

    description TEXT,

    technologies TEXT,

    github_url TEXT,

    live_url TEXT,

    thumbnail TEXT,

    status VARCHAR(30) DEFAULT 'Draft',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-----------------------------------------------------

-- Project Likes

CREATE TABLE IF NOT EXISTS project_likes (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id,user_id),

    FOREIGN KEY(project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-----------------------------------------------------

-- Project Comments

CREATE TABLE IF NOT EXISTS project_comments (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-----------------------------------------------------

-- Indexes

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_projects_user
ON projects(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_project
ON project_comments(project_id);

CREATE INDEX IF NOT EXISTS idx_likes_project
ON project_likes(project_id);