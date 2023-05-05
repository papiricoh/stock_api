// Importar modelo de usuario
const User = require('../models/db');

exports.getCompanyData = async (req, res) => {
  try {
    const { label } = req.params;
    const company = await User.getCompanyData(label);
    const comp = await User.getCompanyHistory(company.id);
    const ownedShares = await User.getCompanyTotalOwnedShares(company.id);
    company.history = comp;
    company.shares = { avariableShares: company.total_shares - ownedShares.totalOwnedShares, ownedShares: ownedShares.totalOwnedShares}
    res.status(200).json(company);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};
exports.getCompaniesList = async (req, res) => {
  try {
    const companiesIDs = await User.getAllCompaniesLabels();
    const result = [];
    for (let index = 0; index < companiesIDs.length; index++) {
      let company = {};
      company = await User.getCompanyData(companiesIDs[index].company_label);
      company.actual_price = await User.getActualPrice(company.id);
      company.market_cap = company.total_shares * company.actual_price;
      result[result.length] = company;
    }
    res.status(200).json(result.reverse());
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};
