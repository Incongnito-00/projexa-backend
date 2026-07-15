const db = require("../config/database");

// ================================
// Find user by email
// ================================

const findUserByEmail = async (email) => {
    const query = `
        SELECT *
        FROM users
        WHERE email = $1
    `;

    const result = await db.query(query, [email]);

    return result.rows[0];
};

// ================================
// Find user by ID
// ================================

const findUserById = async (id) => {
    const query = `
        SELECT
            id,
            full_name,
            email,
            avatar,
            role,
            is_verified,
            created_at
        FROM users
        WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
};

// ================================
// Find Google User
// ================================

const findGoogleUser = async (googleId) => {
    const query = `
        SELECT *
        FROM users
        WHERE google_id = $1
    `;

    const result = await db.query(query, [googleId]);

    return result.rows[0];
};

// ================================
// Create User
// ================================

const createUser = async (user) => {

    const query = `
        INSERT INTO users
        (
            full_name,
            email,
            password,
            avatar,
            role,
            is_verified
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING
            id,
            full_name,
            email,
            avatar,
            role,
            is_verified,
            created_at
    `;

    const values = [
        user.full_name,
        user.email,
        user.password,
        user.avatar,
        user.role,
        user.is_verified
    ];

    const result = await db.query(query, values);

    return result.rows[0];
};

// ================================
// Create Google User
// ================================

const createGoogleUser = async (user) => {

    const query = `
        INSERT INTO users
        (
            full_name,
            email,
            google_id,
            avatar,
            role,
            is_verified
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING *
    `;

    const values = [
        user.full_name,
        user.email,
        user.google_id,
        user.avatar,
        user.role,
        true
    ];

    const result = await db.query(query, values);

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    findUserById,
    findGoogleUser,
    createUser,
    createGoogleUser
};