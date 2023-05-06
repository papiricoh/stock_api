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
    async getPlayerMoney(player) { //player = id
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_wallet WHERE owner_id = ?`, 
        [player]
        );
        if (rows.length) {
            return rows[0].money;
        }
        throw new Error('Wallet with owner: ' + player + ' -> Not Exists');
    },
    async updateMoney(user_id, money) {
        const [rows, fields] = await connection.promise().query(
        `UPDATE stock_wallet SET money = ? WHERE owner_id = ?`, 
        [money, user_id]
        );
        if (rows.info) {
            return rows;
        }
        throw new Error('Wallet with owner: ' + user_id + ' -> Not Exists');
    },
    async insertNewCompany(company) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_companies (company_name, company_label, owner_id, money, total_shares) VALUES (?, ?, ?, ?, ?)`, 
        [company.name, company.label, company.owner_id, company.company_money, company.total_shares]
        );
        if (rows.insertId) {
            return company.label;
        }
        throw new Error('Company with label: ' + company.label + ' -> Allready Exists');
    },
    async insertInitialHistory(id, current_price) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_history (price, company_id) VALUES (?, ?)`, 
        [current_price, id]
        );
        if (rows.insertId) {
            return current_price;
        }
        throw new Error('Unable to Insert History');
    },
    async insertInitialOwnerStockShares(id, owner_id, owner_shares) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_shares (owner_id, quantity, company_id) VALUES (?, ?, ?)`, 
        [owner_id, owner_shares, id]
        );
        if (rows.insertId) {
            return owner_shares;
        }
        throw new Error('Unable to Insert Shares');
    },
};
  
module.exports = User;