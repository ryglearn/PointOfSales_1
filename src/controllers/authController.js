import pool from "../config/db.js";
import dotenv from "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Email atau Password Salah !" });
    const user = rows[0];

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Email atau Password Salah !" });

    // membuat token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRED }
    );
    return res.status(200).json({
        success:true,
        token,
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
            
        }
    });
  } catch (error) {
    next(error);
  }
};
