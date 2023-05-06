// Importar modelo de usuario
const User = require('../models/db');

exports.getCompanyData = async (req, res) => {
  try {
    const { label } = req.params;
    const company = await User.getCompanyData(label);
    const comp = await User.getCompanyHistory(company.id);
    const ownedShares = await User.getCompanyTotalOwnedShares(company.id);
    company.history = comp;
    if(ownedShares.totalOwnedShares == null) {
      ownedShares.totalOwnedShares = 0;
    }
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
    res.status(200).json(result);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postCreateCompany = async (req, res) => {
  try {
    const body = req.body; //name, label, owner_id, total_shares, initial_money, percentage_sold
    let checkOwner = body.owner_id;
    if(body.owner_id == 'Index' || body.owner_id == 'NPC') {
      checkOwner = null;
    }
    //CHECK OWNER MONEY AVARIABILITY 
    if(await User.checkCompanyLabelAvariability(body.label) && await User.checkCompanyOwnerAvariability(checkOwner)) {
      let sold_money = Number((body.initial_money * body.percentage_sold).toFixed(2));
      let sold_shares = Number((body.total_shares * body.percentage_sold).toFixed(2));
      let company_price = Number((sold_money / sold_shares).toFixed(2)); 
      const company = { name: body.name, label: body.label, owner_id: body.owner_id, company_money: body.initial_money - sold_money, total_shares: Number(body.total_shares), owner_shares: body.total_shares - sold_shares, current_price: company_price}
      //TODO SQL INSERTS: COMPANY, HISTORY AND OWNER STOCK WALLET
      res.status(200).json(company);
    }
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};
