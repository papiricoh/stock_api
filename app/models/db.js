const mysql = require("mysql2");
const dbConfig = require("../config/dbConfig.js");

// Create a connection to the database
const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// open the MySQL connection
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

const User = {
    async getAllCompaniesLabels() {
        const [rows, fields] = await connection.promise().query(
        `SELECT company_label FROM stock_companies`);
        if (rows.length) {
            return rows;
        }
        throw new Error('No Companies in the database');
    },
    async getCompanyData(label) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_companies WHERE company_label = ?`, 
        [label]
        );
        if (rows.length) {
            return rows[0];
        }
        throw new Error('Company with label: ' + label + ' -> Not found');
    },
    async getCompanyHistory(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_history WHERE company_id = ? ORDER BY movement_date DESC LIMIT 40;`, 
        [id]
        );
        if (rows.length) {
            return rows;
        }
        throw new Error('History of company with id: ' + id + ' -> Not found');
    },
    async getActualPrice(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT price FROM stock_history WHERE company_id = ? ORDER BY movement_date DESC LIMIT 1;`, 
        [id]
        );
        if (rows.length) {
            return rows[0].price;
        }
        throw new Error('History of company with id: ' + id + ' -> Not found');
    },
    async getCompanyTotalOwnedShares(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT SUM(quantity) AS totalOwnedShares FROM stock_shares WHERE company_id = ?`, 
        [id]
        );
        if (rows.length) {
            return rows[0];
        }
        throw new Error('Shares of company with id: ' + id + ' -> Not found');
    },
    async checkCompanyLabelAvariability(label) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_companies WHERE company_label = ?`, 
        [label]
        );
        if (rows.length == 0) {
            return true;
        }
        throw new Error('Company with label: ' + label + ' -> Already Exists');
    },
    async checkCompanyOwnerAvariability(owner) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_companies WHERE owner_id = ?`, 
        [owner]
        );
        if (rows.length == 0) {
            return true;
        }
        throw new Error('Company with owner: ' + owner + ' -> Already Exists');
    },
};
  
module.exports = User;