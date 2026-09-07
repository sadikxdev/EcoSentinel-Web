import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await db.query(
      `DELETE FROM customer_otps
       WHERE email = $1`,
      [normalizedEmail]
    );

    await db.query(
      `INSERT INTO customer_otps
       (email, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [
        normalizedEmail,
        otpCode,
        expiresAt,
      ]
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: normalizedEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otpCode}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("sendOtpByEmail failed:", err);

    return res.status(500).json({
      message: "Server error sending OTP",
    });
  }
};

export const verifyOtpByEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim() || !otp || !otp.trim()) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = otp.trim();

    const result = await db.query(
      `SELECT *
       FROM customer_otps
       WHERE email = $1
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    const record = result.rows[0];

    if (record.otp_code !== normalizedOtp) {
      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        purpose: "registration",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    await db.query(
      `UPDATE customers
       SET is_email_verified = true
       WHERE email = $1`,
      [normalizedEmail]
    );

    await db.query(
      `DELETE FROM customer_otps
       WHERE id = $1`,
      [record.id]
    );

    return res.status(200).json({
      message: "Email verified successfully",
      verificationToken,
    });
  } catch (err) {
    console.error("verifyOtpByEmail failed:", err);

    return res.status(500).json({
      message: "Server error verifying OTP",
    });
  }
};