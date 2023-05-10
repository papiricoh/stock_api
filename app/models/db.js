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
    async getAllGroups() {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_groups`);
        if (rows.length) {
            return rows;
        }
        throw new Error('No Groups in the database');
    },
    async getGroupById(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_groups WHERE id = ?`,
        [id]);
        if (rows.length) {
            return rows[0];
        }
        throw new Error('Group with id: ' + id + " -> Doesnt Exist");
    },
    async getGroupByLabel(label) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_groups WHERE group_label = ?`,
        [label]);
        if (rows.length) {
            return rows[0];
        }
        throw new Error('Group with label: ' + label + " -> Doesnt Exist");
    },
    async getGroupOwnedCompanies(group_id) { //In format: (group:0000)
        if(!group_id.includes("group:")) {
            throw new Error('ID: ' + group_id + " is not a group identifier format: (group:0000)" );
        }
        group_id = Number(group_id.substr(6));
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_companies WHERE owner_id = ?`,
        [group_id]);
        if (rows.length) {
            return rows;
        }
        throw new Error('Group with label: ' + group_id + " -> Doesnt Exist");
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
        `SELECT * FROM stock_history WHERE company_id = ? ORDER BY movement_date DESC LIMIT 100;`, 
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
    async getMayorShareholder(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_shares WHERE company_id = ? ORDER BY quantity DESC
        LIMIT 1;`, 
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
    async getSharesFromId(id, company_id) { //player = id
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_shares WHERE owner_id = ? AND company_id = ?`, 
        [id, company_id]
        );
        if (rows.length) {
            return rows[0];
        }
        throw new Error('Shares of company id: ' + company_id + 'with owner: ' + id + ' -> Not Exists');
    },
    async getCheckUser(id) { //player = id
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM stock_wallet WHERE owner_id = ?`, 
        [id]
        );
        if (rows.length) {
            return rows[0];
        }
        throw new Error('User with id: ' + id + ' -> Dont have a stock wallet');
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
    async insertNewWallet(id) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_wallet (owner_id, money) VALUES (?, ?)`, 
        [id, 0]
        );
        if (rows.insertId) {
            return id;
        }
        throw new Error('Failed to insert wallet');
    },
    async insertInitialHistory(id, current_price, volume) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_history (price, volume, company_id) VALUES (?, ?, ?)`, 
        [current_price, volume, id]
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
    async insertEmptyShares(player_id, company_id) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_shares (owner_id, quantity, company_id) VALUES (?, 0, ?)`, 
        [player_id, company_id]
        );
        if (rows.insertId) {
            return player_id;
        }
        throw new Error('Unable to Insert Shares');
    },
    async insertNewHistory(company_id, new_price, volume) {
        const [rows, fields] = await connection.promise().query(
        `INSERT INTO stock_history (price, volume, company_id) VALUES (?, ?, ?)`, 
        [new_price, volume, company_id]
        );
        if (rows.insertId) {
            return rows;
        }
        throw new Error('Unable to Insert New History');
    },
    async updateShares(player_id, company_id, quantity) {
        const [rows, fields] = await connection.promise().query(
        `UPDATE stock_shares SET quantity = ? WHERE owner_id = ? AND company_id = ?`, 
        [quantity, player_id, company_id]
        );
        if (rows.info) {
            return rows;
        }
        throw new Error('Unable to Insert Shares');
    },
    async changeOwner(player_id, company_id) {
        const [rows, fields] = await connection.promise().query(
        `UPDATE stock_companies SET owner_id = ? WHERE id = ?`, 
        [player_id, company_id]
        );
        if (rows.info) {
            return rows;
        }
        throw new Error('Unable to Update Owner of company_id: ' + company_id);
    },
};
  
module.exports = User;