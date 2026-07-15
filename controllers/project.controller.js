const {
    createProject,
    getAllProjects,
    getProjectById
} = require("../models/project.model");

// =====================================
// Create Project
// =====================================

const create = async (req, res) => {

    try {

        const {
            title,
            category,
            description,
            technologies,
            github_url,
            live_url,
            thumbnail
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        const project = await createProject({

            user_id: req.user.id,

            title,

            category: category || null,

            description,

            technologies: technologies || [],

            github_url: github_url || null,

            live_url: live_url || null,

            thumbnail: thumbnail || null,

            status: "Draft"

        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully.",
            project
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Get All Projects
// =====================================

const getAll = async (req, res) => {

    try {

        const projects = await getAllProjects();

        return res.json({
            success: true,
            total: projects.length,
            projects
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =====================================
// Get Single Project
// =====================================

const getOne = async (req, res) => {

    try {

        const project = await getProjectById(req.params.id);

        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found."
            });

        }

        return res.json({
            success: true,
            project
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    create,
    getAll,
    getOne
};