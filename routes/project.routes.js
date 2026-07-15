const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
    create,
    getAll,
    getOne
} = require("../controllers/project.controller");

// Public Routes
router.get("/", getAll);

router.get("/:id", getOne);

// Protected Route
router.post("/", authenticate, create);

module.exports = router;