const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 5598;
const cors = require("cors");
app.use(cors());
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.POSTGRES_USER || "user_hir_yokoyama",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "db_hir_yokoyama",
  password: process.env.POSTGRES_PASSWORD || "パスワード",
  port: 5432,
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
 
// 全顧客取得
app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});
 
// 特定顧客取得
app.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const customerData = await pool.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [customerId]
    );
    res.json(customerData.rows[0]);
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
 
// 顧客追加
app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
 
// 顧客削除
app.delete("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    await pool.query("DELETE FROM customers WHERE customer_id = $1", [customerId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
 
// 顧客更新
app.put("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { companyName, industry, contact, location } = req.body;
    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5",
      [companyName, industry, contact, location, customerId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
 
app.use(express.static("public"));
