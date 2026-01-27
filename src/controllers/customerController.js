import pool from "../config/db.js";
import { autoGenerateCode } from "../utils/AutoGenerateCode.js";

export default {
  getAllCustomer: async (req, res, next) => {
    try {
      const { page, limit, search } = req.validatedQuery;
      const offset = (page - 1) * limit;

      let countQuery = "SELECT COUNT(*) as total FROM customers";
      let countParams = [];

      if (search) {
        countQuery += " WHERE customer_code LIKE ? OR name LIKE ?";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await pool.execute(countQuery, countParams);

      const totalData = countRows[0].total;
      const totalPage = Math.ceil(totalData / limit);

      let mainQuery =
        "SELECT id, customer_code, name, address, phone, created_at, updated_at FROM customers ";
      let mainParams = [];

      if (search) {
        mainQuery += " WHERE customer_code LIKE ? OR name LIKE ?";
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
  getCustomerById: async (req, res, next) => {
    try {
      const { id } = req.validatedParams;
      const query =
        "SELECT id, customer_code, name, address, phone, created_at, updated_at FROM customers WHERE id = ? ";
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
  createCustomer: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { name, address, phone } = req.validatedBody;
      const [code] = await conn.execute(
        "SELECT customer_code FROM customers ORDER BY id DESC"
      );
      const lastcode = code.length > 0 ? code[0].customer_code : null;
      const newCustomerCode = autoGenerateCode(lastcode, "CUST", 3);

      const [result] = await conn.execute(
        "INSERT INTO customers(customer_code, name, address, phone) VALUES (?,?,?,?)",
        [newCustomerCode, name, address, phone]
      );
      await conn.commit();
      return res.status(201).json({
        success: true,
        message: "Data Telah Ditambahkan",
        data: {
          customer_code: newCustomerCode,
          name: name,
          address: address,
          phone: phone,
        },
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  updateCustomer: async (req, res, next) => {
    try {
      const { id } = req.validatedParams;
      const { name, address, phone } = req.validatedBody;
      const query =
        "UPDATE customers SET name=?, address=?, phone=? WHERE id = ?";
      const [result] = await pool.execute(query, [name, address, phone, id]);
      if (result.affectedRows === 0)
        return res
          .status(200)
          .json({ success: false, message: "data tidak ditemukan" });
      return res.status(200).json({
        success: true,
        message: "data Telah diperbarui",
        data: { id: id, name: name, address: address, phone: phone },
      });
    } catch (error) {
      next(error);
    }
  },
  deleteCustomer: async (req, res, next) => {
    try {
      const { id } = req.validatedParams;
      let query = "DELETE FROM customers WHERE id = ? ";
      const [result] = await pool.execute(query, [id]);
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ succes: false, message: "Data Tidak Ditemukan" });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
