const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ======================
// JWT Middleware
// ======================

function authenticate(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  const token = auth.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}

// ======================
// Apply for Project
// ======================

router.post("/:projectId", authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const { projectId } = req.params;

    const project = await db.query(
      "SELECT * FROM projects WHERE id=$1",
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.rows[0].owner_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own project",
      });
    }

    const existing = await db.query(
      `SELECT * FROM applications
       WHERE project_id=$1
       AND applicant_id=$2`,
      [projectId, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already applied",
      });
    }

    const result = await db.query(
      `INSERT INTO applications
      (project_id, applicant_id, message)
      VALUES($1,$2,$3)
      RETURNING *`,
      [projectId, req.user.id, message]
    );

    res.json({
      success: true,
      application: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ======================
// My Applications
// ======================

router.get("/my", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
      applications.*,
      projects.title,
      projects.category,
      projects.status AS project_status
      FROM applications
      JOIN projects
      ON projects.id=applications.project_id
      WHERE applicant_id=$1
      ORDER BY applications.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ======================
// Applications for My Projects
// ======================

router.get("/project/:projectId", authenticate, async (req, res) => {
  try {
    const project = await db.query(
      "SELECT * FROM projects WHERE id=$1",
      [req.params.projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await db.query(
      `
      SELECT
      applications.*,
      users.name,
      users.email,
      users.profile_image
      FROM applications
      JOIN users
      ON users.id=applications.applicant_id
      WHERE project_id=$1
      ORDER BY applications.created_at DESC
    `,
      [req.params.projectId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ======================
// Accept / Reject Application
// ======================

router.put("/:applicationId", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const check = await db.query(
      `
      SELECT
      applications.id,
      projects.owner_id
      FROM applications
      JOIN projects
      ON projects.id=applications.project_id
      WHERE applications.id=$1
    `,
      [req.params.applicationId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (check.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await db.query(
      `
      UPDATE applications
      SET status=$1
      WHERE id=$2
      RETURNING *
    `,
      [status, req.params.applicationId]
    );

    res.json({
      success: true,
      application: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;