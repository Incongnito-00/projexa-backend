const bcrypt = require("bcrypt");

const {
    findUserByEmail,
    createUser
} = require("../models/user.model");

const {
    generateToken
} = require("../utils/jwt");

// ============================================
// REGISTER
// ============================================

const register = async (req, res) => {

    try {

        let {
            full_name,
            email,
            password
        } = req.body;

        // ============================================
        // Required Fields
        // ============================================

        if (!full_name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // ============================================
        // Normalize Input
        // ============================================

        full_name = full_name.trim();
        email = email.trim().toLowerCase();

        // ============================================
        // Full Name Validation
        // ============================================

        if (full_name.length < 3) {

            return res.status(400).json({
                success: false,
                message: "Full name must contain at least 3 characters."
            });

        }

        // ============================================
        // Email Validation
        // ============================================

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });

        }

        // ============================================
        // Password Validation
        // ============================================

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

        if (!passwordRegex.test(password)) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and contain uppercase, lowercase, number and special character."
            });

        }

        // ============================================
        // Check Existing User
        // ============================================

        const existingUser = await findUserByEmail(email);

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }

        // ============================================
        // Hash Password
        // ============================================

        const hashedPassword = await bcrypt.hash(password, 10);

        // ============================================
        // Create User
        // ============================================

        const newUser = await createUser({

            full_name,

            email,

            password: hashedPassword,

            avatar: null,

            role: "student",

            is_verified: false

        });

        // ============================================
        // Generate JWT
        // ============================================

        const token = generateToken(newUser);

        return res.status(201).json({

            success: true,

            message: "Registration successful.",

            token,

            user: {

                id: newUser.id,

                full_name: newUser.full_name,

                email: newUser.email,

                avatar: newUser.avatar,

                role: newUser.role,

                is_verified: newUser.is_verified

            }

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

// ============================================
// LOGIN
// ============================================

const login = async (req, res) => {

    try {

        let {

            email,

            password

        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        email = email.trim().toLowerCase();

        // ============================================
        // Find User
        // ============================================

        const user = await findUserByEmail(email);

        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        // ============================================
        // Verify Password
        // ============================================

        const isMatch = await bcrypt.compare(

            password,

            user.password

        );

        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        // ============================================
        // Generate JWT
        // ============================================

        const token = generateToken(user);

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: {

                id: user.id,

                full_name: user.full_name,

                email: user.email,

                avatar: user.avatar,

                role: user.role,

                is_verified: user.is_verified

            }

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

module.exports = {

    register,

    login

};