// Importar modelo de usuario
const User = require('../models/db');

exports.getCompanyData = async (req, res) => {
  try {
    const { label } = req.params;
    const company = await User.getCompanyData(label);
    const comp = await User.getCompanyHistory(company.id);
    company.history = comp;
    res.status(200).json(company);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};
