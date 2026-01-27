import pool from "../config/db.js";
import { autoGenerateCode } from "../utils/AutoGenerateCode.js";

export default {
  getAllTransaction: async (req, res, next) => {
    try {
      const { page, limit, search } = req.validatedQuery;
      const offset = (page - 1) * limit;


      let countQuery = "SELECT COUNT(*) as total FROM transactions";
      let countParams = [];

      if (search) {
        countQuery += " WHERE transaction_code LIKE ? ";
        countParams.push(`%${search}%`);
      }

      const [countRows] = await pool.execute(countQuery, countParams);

      const totalData = countRows[0].total;
      const totalPage = Math.ceil(totalData / limit);

      let mainQuery =
        "SELECT t.*, u.name AS `CASHIER`, c.name AS `CUSTOMERS` FROM transactions AS t JOIN users AS u ON t.user_id = u.id JOIN customers AS c ON t.customer_id = c.id  ";
      let mainParams = [];

      if (search) {
        mainQuery += " WHERE transaction_code LIKE ?";
        mainParams.push(`%${search}%`);
      }

      mainQuery += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
      // mainParams.push(Number(limit), Number(offset));

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
  getTransactionById: async (req, res, next) => {
    try {
      const { id } = req.validatedParams;
      const query =
        "SELECT t.*, u.name AS `CASHIER`, c.name AS `CUSTOMERS` FROM transactions AS t JOIN users AS u ON t.user_id = u.id JOIN customers AS c ON t.customer_id = c.id  WHERE t.id = ? ";
      const params = [id];
      const [rows] = await pool.execute(query, params);
      
      if (rows.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Data Tidak ditemukan" });

      const [items] = await pool.execute(
        "SELECT it.*, p.name as product_name, p.product_code FROM items_transactions it JOIN products p ON it.product_id = p.id WHERE it.transaction_id = ?",
        [id]
      );

      return res.status(200).json({ 
        success: true, 
        data: { 
          ...rows[0], 
          items: items 
        } 
      });
    } catch (error) {
      next(error);
    }
  },
  createTransaction: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { customer_id, items } = req.validatedBody;
      const user_id = req.user.id;
      const [trxCode] = await conn.execute(
        "SELECT transaction_code FROM transactions ORDER BY id DESC LIMIT 1 FOR UPDATE",
      );
      const lastCode = trxCode.length ? trxCode[0].transaction_code : null;
      const newTrxCode = autoGenerateCode(lastCode, "INVOICE", 3);

      const [trxHeader] = await conn.execute(
        "INSERT INTO transactions(transaction_code, user_id, customer_id) VALUES (?,?,?)",
        [newTrxCode, user_id, customer_id],
      );

      const transactionId = trxHeader.insertId;
      let grandTotal = 0;
      let totalQty = 0;
      const detailItems = [];

      for (const item of items) {
        const { product_id, qty } = item;

        const [products] = await conn.execute(
          "SELECT price, stock FROM products WHERE id = ? FOR UPDATE",
          [product_id],
        );

        if (products.length === 0)
          throw Object.assign(new Error("PRODUCT_TIDAK_DITEMUKAN"), {
            status: 400,
          });

        const product = products[0];

        if (product.stock < qty)
          throw Object.assign(new Error("STOCK_TIDAK_CUKUP"), { status: 400 });

        const subtotal = product.price * qty;

        await conn.execute(
          "INSERT INTO items_transactions(transaction_id, product_id, on_sales_price, qty) VALUES (?,?,?,?)",
          [transactionId, product_id, product.price, qty],
        );

        await conn.execute(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [qty, product_id],
        );

        grandTotal += subtotal;
        totalQty += qty;

        detailItems.push({
          product_id,
          product_name: product.name,
          price: product.price,
          qty,
          subtotal,
        });
      }
      await conn.execute(
        "UPDATE transactions SET total_price = ? WHERE id = ?",
        [grandTotal, transactionId],
      );
      await conn.commit();

      res.status(201).json({
        success: true,
        transaction_code: newTrxCode,
        summary: {
          total_item: totalQty,
          grand_total: grandTotal,
        },
        items: detailItems,
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  deleteTransaction: async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.validatedParams;
      const [trx] = await conn.execute(
        "SELECT id FROM transactions WHERE id = ?",
        [id],
      );
      if (trx.length === 0) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      const [items] = await conn.execute(
        "SELECT product_id, qty FROM items_transactions WHERE transaction_id = ?",
        [id],
      );
      for (const item of items) {
        const { product_id, qty } = item;
        await conn.execute(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [qty, product_id],
        );
      }
      await conn.execute(
        "DELETE FROM items_transactions WHERE transaction_id = ?",
        [id],
      );
      await conn.execute("DELETE FROM transactions WHERE id = ?", [id]);
      await conn.commit();
      return res.status(200).json({
        success: true,
        message: "Transaksi berhasil dihapus",
      });
    } catch (error) {
      await conn.rollback();
      next(error);
    } finally {
      conn.release();
    }
  },
  transactionReport: async (req, res, next) => {
    try {
      let { date_start, date_end } = req.validatedQuery;
      if (!date_start || !date_end) {
        const today = new Date().toISOString().slice(0, 10);
        date_start = today;
        date_end = today;
      }
      const query =
        "SELECT t.id, t.transaction_code, u.name AS `cashier`, c.name AS `customer`, DATE(t.created_at) AS `transaction_date`, SUM(it.qty) AS `total_item`, SUM(it.qty * on_sales_price) AS `total_amount` FROM transactions AS t JOIN users AS u  ON t.user_id = u.id JOIN customers AS c ON t.customer_id = c.id JOIN items_transactions AS it ON it.transaction_id = t.id WHERE DATE(t.created_at) BETWEEN ? AND ? GROUP BY t.id ORDER BY t.id DESC";
      const [rows] = await pool.execute(query, [date_start, date_end]);
      return res.status(200).json({
        success: true,
        period: { date_start, date_end },
        total_transaction: rows.length,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  },
};
