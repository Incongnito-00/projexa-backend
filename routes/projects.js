const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// =====================
// JWT Middleware
// =====================

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  const token = header.split(" ")[1];

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

// =====================
// Create Project
// =====================

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      requirements,
      budget,
    } = req.body;

    const result = await db.query(
      `INSERT INTO projects
      (owner_id,title,category,description,requirements,budget)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        req.user.id,
        title,
        category,
        description,
        requirements,
        budget,
      ]
    );

    res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =====================
// Get All Projects
// =====================

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
      projects.*,
      users.name AS owner_name,
      users.email AS owner_email,
      users.profile_image
      FROM projects
      JOIN users
      ON users.id = projects.owner_id
      ORDER BY projects.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =====================
// Get Single Project
// =====================

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
      projects.*,
      users.name AS owner_name,
      users.email AS owner_email
      FROM projects
      JOIN users
      ON users.id=projects.owner_id
      WHERE projects.id=$1
    `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =====================
// Update Project
// =====================

router.put("/:id", authenticate, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      requirements,
      budget,
      status,
    } = req.body;

    const owner = await db.query(
      "SELECT owner_id FROM projects WHERE id=$1",
      [req.params.id]
    );

    if (owner.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (owner.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await db.query(
      `
      UPDATE projects
      SET
      title=$1,
      category=$2,
      description=$3,
      requirements=$4,
      budget=$5,
      status=$6
      WHERE id=$7
      RETURNING *
    `,
      [
        title,
        category,
        description,
        requirements,
        budget,
        status,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      project: updated.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =====================
// Delete Project
// =====================

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const owner = await db.query(
      "SELECT owner_id FROM projects WHERE id=$1",
      [req.params.id]
    );

    if (owner.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (owner.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await db.query(
      "DELETE FROM projects WHERE id=$1",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Project deleted",
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