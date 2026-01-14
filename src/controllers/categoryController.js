import pool from "../config/db.js";
import { autoGenerateCode } from "../utils/AutoGenerateCode.js";

export default {
  getAllCategory: async (req, res, next) => {
    try {
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 10;
      // const search = req.query.search || "";
      const {page, limit, search} = req.validatedQuery;
      const offset = (page - 1) * limit;

      let countQuery = "SELECT COUNT(*) as total FROM categories";
      let countParams = [];

      if (search) {
        countQuery += " WHERE category_code LIKE ? OR name LIKE ?";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await pool.execute(countQuery, countParams);

      const totalData = countRows[0].total;
      const totalPage = Math.ceil(totalData / limit);

      let mainQuery =
        "SELECT id, category_code, name, created_at, updated_at FROM categories ";
      let mainParams = [];

      if (search) {
        mainQuery += " WHERE category_code LIKE ? OR name LIKE ?";
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
  getCategoryById: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      const query =
        "SELECT id, category_code, name, created_at, updated_at FROM categories WHERE id = ? ";
      const [rows] = await pool.execute(query, [id]);
      if (rows.length == 0)
        return res.status(404).json({success: false, message: "Data Tidak Ditemukan !" });
      return res.status(200).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
  createCategory: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { name } = req.validatedBody;
      const [code] = await conn.execute(
        "SELECT category_code FROM categories ORDER BY id DESC"
      );
      const lastcode = code.length > 0 ? code[0].category_code : null;
      const newCategoryCode = autoGenerateCode(lastcode, "CAT", 3);

      const [result] = await conn.execute(
        "INSERT INTO categories(category_code, name) VALUES (?,?)",
        [newCategoryCode, name]
      );
      await conn.commit();
      return res.status(201).json({
        success: true,
        message: "Data Telah Ditambahkan",
        data: {
          category_code: newCategoryCode,
          name: name,
        },
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  updateCategory: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      const { name} = req.validatedBody;
      const query =
        "UPDATE categories SET name=? WHERE id = ?";
      const [result] = await pool.execute(query, [name, id]);
      if (result.affectedRows === 0)
        return res.status(404).json({success: false, message: "data tidak ditemukan" });
      return res
        .status(200)
        .json({
          success: true,
          message: "data Telah diperbarui",
          data: { id: id, name: name},
        });
    } catch (error) {
      next(error);
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      let query = "DELETE FROM categories WHERE id = ? ";
      const [result] = await pool.execute(query, [id]);
      if (result.affectedRows === 0)
        return res.status(404).json({success: false, message: "Data Tidak Ditemukan" });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
