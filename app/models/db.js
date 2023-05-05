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
    async getProductById(id) {
        const [rows, fields] = await connection.promise().query(
        `SELECT * FROM products WHERE id = ?`, 
        [id]
        );
        if (rows.length) {
            return rows[0];
        }
        return new Error('Product with id: ' + id + ' -> Not found');
    },
};
  
module.exports = User;