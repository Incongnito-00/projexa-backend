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

        const {
            full_name,
            email,
            password
        } = req.body;

        // Validation

        if (!full_name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // Check Existing User

        const existingUser = await findUserByEmail(email);

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }

        // Hash Password

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User

        const newUser = await createUser({

            full_name,

            email,

            password: hashedPassword,

            avatar: null,

            role: "student",

            is_verified: false

        });

        // JWT

        const token = generateToken(newUser);

        return res.status(201).json({

            success: true,

            message: "Registration successful.",

            token,

            user: newUser

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

        const {

            email,

            password

        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        const user = await findUserByEmail(email);

        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

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

        const token = generateToken(user);

        return res.json({

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