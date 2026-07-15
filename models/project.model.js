const db = require("../config/database");

// ================================
// Create Project
// ================================

const createProject = async (project) => {
    const query = `
        INSERT INTO projects
        (
            user_id,
            title,
            category,
            description,
            technologies,
            github_url,
            live_url,
            thumbnail,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *;
    `;

    const values = [
        project.user_id,
        project.title,
        project.category,
        project.description,
        project.technologies,
        project.github_url,
        project.live_url,
        project.thumbnail,
        project.status
    ];

    const result = await db.query(query, values);

    return result.rows[0];
};

// ================================
// Get All Projects
// ================================

const getAllProjects = async () => {

    const result = await db.query(`
        SELECT
            p.*,
            u.full_name,
            u.avatar
        FROM projects p
        JOIN users u
        ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `);

    return result.rows;
};

// ================================
// Get Project By ID
// ================================

const getProjectById = async (id) => {

    const result = await db.query(
        `
        SELECT
            p.*,
            u.full_name,
            u.avatar
        FROM projects p
        JOIN users u
        ON p.user_id = u.id
        WHERE p.id = $1
        `,
        [id]
    );

    return result.rows[0];
};
// ======================================
// Update Project
// ======================================

const updateProject = async (id, project) => {

    const query = `
        UPDATE projects
        SET
            title = $1,
            category = $2,
            description = $3,
            technologies = $4,
            github_url = $5,
            live_url = $6,
            thumbnail = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *;
    `;

    const values = [
        project.title,
        project.category,
        project.description,
        project.technologies,
        project.github_url,
        project.live_url,
        project.thumbnail,
        id
    ];

    const result = await db.query(query, values);

    return result.rows[0];
};

// ======================================
// Delete Project
// ======================================

const deleteProject = async (id) => {

    const result = await db.query(
        `
        DELETE FROM projects
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};