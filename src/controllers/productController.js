import { success } from "zod";
import pool from "../config/db.js";
import { autoGenerateCode } from "../utils/AutoGenerateCode.js";

export default {
  getAllproduct: async (req, res, next) => {
    try {
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 10;
      const {page, limit, search} = req.validatedQuery;
      const offset = (page - 1) * limit;
      // const search = req.query.search || "";

      let countQuery =
        "SELECT COUNT(*) as total FROM products as p JOIN categories as c ON p.category_id = c.id ";
      let countParams = [];

      if (search) {
        countQuery += " WHERE product_code LIKE ? OR name LIKE ?";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await pool.execute(countQuery, countParams);

      const totalData = countRows[0].total;
      const totalPage = Math.ceil(totalData / limit);

      let mainQuery =
        "SELECT p.*, c.name AS `categories` FROM products as p JOIN categories as c ON p.category_id = c.id ";
      let mainParams = [];

      if (search) {
        mainQuery += " WHERE product_code LIKE ? OR name LIKE ?";
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
  getproductById: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      const query =
        "SELECT p.*, c.name AS `categories` FROM products AS p JOIN categories AS c ON p.category_id = c.id WHERE p.id = ? ";
      const [rows] = await pool.execute(query, [id]);
      if (rows.length == 0)
        return res.status(404).json({success: false, message: "Data Tidak Ditemukan !" });
      return res.status(200).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },

  createproduct: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { name, price, stock, category_id } = req.validatedBody;
      const [code] = await conn.execute(
        "SELECT product_code FROM products ORDER BY id DESC"
      );
      const lastcode = code.length > 0 ? code[0].product_code : null;
      const newproductCode = autoGenerateCode(lastcode, "PROD", 3);

      const [result] = await conn.execute(
        "INSERT INTO products(product_code, name, price, stock, category_id) VALUES (?,?,?,?,?)",
        [newproductCode, name, price, stock, category_id]
      );
      await conn.commit();
      return res.status(201).json({
        success: true,
        message: "Data Telah Ditambahkan",
        data: {
          product_code: newproductCode,
          name: name,
          price: price,
          stock: stock,
          category_id: category_id
        },
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  updateproduct: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      const { name, price, stock } = req.validatedBody;
      const query = "UPDATE products SET name=?, price=?, stock=? WHERE id = ?";
      const [result] = await pool.execute(query, [name, price, stock, id]);
      if (result.affectedRows === 0)
        return res.status(200).json({success: false, message: "data tidak ditemukan" });
      return res.status(200).json({
        success: true,
        message: "data Telah diperbarui",
        data: { id: id, name: name, price: price, stock: stock },
      });
    } catch (error) {
      next(error);
    }
  },
  deleteproduct: async (req, res, next) => {
    try {
      const {id} = req.validatedParams;
      let query = "DELETE FROM products WHERE id = ? ";
      const [result] = await pool.execute(query, [id]);
      if (result.affectedRows === 0)
        return res.status(404).json({success: false, message: "Data Tidak Ditemukan" });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
