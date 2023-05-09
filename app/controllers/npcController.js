const User = require('../models/db');

exports.example = async (req, res) => {
    try {
        
        res.status(200).json(0);
    } catch (err) {
        if (err.message.includes("Not found")) {
        res.status(404).json({ error: err.message });
        } else {
        res.status(500).json({ error: "Internal Server Error: " + err.message });
        }
    }
};