import pool from "../config/db.js";
import { autoGenerateCode } from "../utils/AutoGenerateCode.js";
import bcrypt from "bcrypt";

export default {
  getAllUser: async (req, res, next) => {
    try {
      const { page, limit, search } = req.validatedQuery;
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 10;
      // const search = req.query.search || "";
      const offset = (page - 1) * limit;

      let countQuery = "SELECT COUNT(*) as total FROM users";
      let countParams = [];

      if (search) {
        countQuery += " WHERE user_code LIKE ? OR name LIKE ?";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await pool.execute(countQuery, countParams);

      const totalData = countRows[0].total;
      const totalPage = Math.ceil(totalData / limit);

      let mainQuery =
        "SELECT id, user_code, name, email, role, created_at, updated_at FROM users ";
      let mainParams = [];

      if (search) {
        mainQuery += " WHERE user_code LIKE ? OR name LIKE ?";
        mainParams.push(`%${search}%`, `%${search}%`);
      }

      mainQuery += " ORDER BY id DESC LIMIT ? OFFSET ?";
      mainParams.push(String(limit), String(offset));

      const [rows] = await pool.execute(mainQuery, mainParams);
      return res.status(200).json({
        success: true,
        meta: {
          current_page: page,
          limit: limit,
          total_data: totalData,
          total_page: totalPage,
        },
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req, res, next) => {
    try {
      // const id = parseInt(req.params.id, 10);
      const { id } = req.validatedParams;
      const query =
        "SELECT id, user_code, name, email,role, created_at, updated_at FROM users WHERE id = ? ";
      const [rows] = await pool.execute(query, [id]);
      if (rows.length == 0)
        return res
          .status(404)
          .json({ success: false, message: "Data Tidak Ditemukan !" });
      return res.status(200).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
  createUser: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { name, email, password, role } = req.validatedBody;
      const hashedPassword = await bcrypt.hash(password, 10);
      const [code] = await conn.execute(
        "SELECT user_code FROM users ORDER BY id DESC"
      );
      const lastcode = code.length > 0 ? code[0].user_code : null;
      const newUserCode = autoGenerateCode(lastcode, "USR", 3);

      const [result] = await conn.execute(
        "INSERT INTO users(user_code, name, email, password, role) VALUES (?,?,?,?,?)",
        [newUserCode, name, email, hashedPassword, role]
      );
      await conn.commit();
      return res.status(201).json({
        succes: true,
        message: "Data Telah Ditambahkan",
        data: { user_code: newUserCode, name: name, email: email, role: role },
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  updateUser: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.validatedParams;
      const { name, email, password, role } = req.validatedBody;
      const hashedPassword = await bcrypt.hash(password, 10);

      let query = "UPDATE users SET name=?, email=?, role=? ";
      let params = [name, email, role];

      if (password) {
        query += " , password= ?";
        params.push(hashedPassword);
      }

      query += " WHERE id = ?";
      params.push(id);

      const [result] = await conn.execute(query, params);

      await conn.commit();
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "Data Tidak Ditemukan" });
      return res.status(200).json({
        success: true,
        message: "Data Telah Ditambahkan",
        data: { id: id, name: name, email: email, role: role },
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.validatedParams;
      let query = "DELETE FROM users WHERE id = ? ";
      const [result] = await pool.execute(query, [id]);
      if (result.affectedRows === 0)
        return res.status(404).json({successL: false,  message: "Data Tidak Ditemukan" });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
