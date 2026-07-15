const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
    getProfile
} = require("../controllers/user.controller");

router.get("/me", authenticate, getProfile);

module.exports = router;