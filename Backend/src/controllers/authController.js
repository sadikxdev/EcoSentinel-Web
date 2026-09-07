import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await db.query(
      `SELECT id, email, first_name, last_name, password,
              location_name, latitude, longitude
       FROM customers
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        location_name: user.location_name,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (err) {
    console.error("login failed:", err);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

export const register = async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      password,
      verificationToken,
      locationName,
      latitude,
      longitude,
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!first_name || !first_name.trim()) {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    if (!last_name || !last_name.trim()) {
      return res.status(400).json({
        message: "Last name is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!verificationToken) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    if (!locationName || !locationName.trim()) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    if (latitude === undefined || latitude === null || latitude === "") {
      return res.status(400).json({
        message: "Latitude is required",
      });
    }

    if (longitude === undefined || longitude === null || longitude === "") {
      return res.status(400).json({
        message: "Longitude is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);

    if (
      !Number.isFinite(numericLatitude) ||
      !Number.isFinite(numericLongitude)
    ) {
      return res.status(400).json({
        message: "Invalid location coordinates",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let decoded;

    try {
      decoded = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET
      );
    } catch (err) {
      return res.status(401).json({
        message: "Email verification expired or invalid",
      });
    }

    if (decoded.purpose !== "registration") {
      return res.status(401).json({
        message: "Invalid verification token",
      });
    }

    if (decoded.email !== normalizedEmail) {
      return res.status(401).json({
        message: "Email verification does not match",
      });
    }

    const existingUser = await db.query(
      "SELECT id FROM customers WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO customers
       (
         email,
         first_name,
         last_name,
         password,
         location_name,
         latitude,
         longitude,
         is_email_verified
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING
         id,
         email,
         first_name,
         last_name,
         location_name,
         latitude,
         longitude,
         is_email_verified`,
      [
        normalizedEmail,
        first_name.trim(),
        last_name.trim(),
        hashedPassword,
        locationName.trim(),
        numericLatitude,
        numericLongitude,
        true,
      ]
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("register failed:", err);

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};