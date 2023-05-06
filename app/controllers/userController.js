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
    let avariable_money = 0;
    if(body.owner_id == 'Index' || body.owner_id == 'NPC') {
      checkOwner = null;
    }else {
      avariable_money = await User.getPlayerMoney(body.owner_id);
    }
    //CHECK OWNER MONEY AVARIABILITY 
    if(avariable_money >= body.initial_money || body.owner_id == 'Index' || body.owner_id == 'NPC') {
      if(await User.checkCompanyLabelAvariability(body.label) && await User.checkCompanyOwnerAvariability(checkOwner)) {
        let sold_money = Number((body.initial_money * body.percentage_sold).toFixed(2));
        let sold_shares = Number((body.total_shares * body.percentage_sold).toFixed(2));
        let company_price = Number((sold_money / sold_shares).toFixed(2)); 
        const company = { name: body.name, label: body.label, owner_id: body.owner_id, company_money: body.initial_money - sold_money, total_shares: Number(body.total_shares), owner_shares: body.total_shares - sold_shares, current_price: company_price}
        //TODO SQL INSERTS: COMPANY, HISTORY AND OWNER STOCK WALLET
        const new_company_label = await User.insertNewCompany(company);
        const new_company = await User.getCompanyData(new_company_label);
        await User.insertInitialHistory(new_company.id, company.current_price);
        await User.insertInitialHistory(new_company.id, company.current_price);
        if(checkOwner != null) {
          await User.insertInitialOwnerStockShares(new_company.id, body.owner_id, company.owner_shares);
          //REMOVE PLAYER MONEY
          await User.updateMoney(body.owner_id, avariable_money - body.initial_money);
        }
        res.status(200).json(company);
      }else {
        throw new Error("already owner of company or label repeated");
      }
    }else {
      throw new Error("Not enought money in the stock wallet"); 
    }
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postBuyShares = async (req, res) => {
  try {
    const body = req.body; //company_label, player_id, quantity,
    const player_money = await User.getPlayerMoney(body.player_id);
    const company = await User.getCompanyData(body.company_label);
    company.actual_price = await User.getActualPrice(company.id);
    const total_owned_shares = await User.getCompanyTotalOwnedShares(company.id);
    if(company.total_shares < body.quantity + total_owned_shares.totalOwnedShares) { //check total shares avariability
      throw new Error("Not enought shares in the company to buy " + body.quantity + " shares."); 
    }
    if(player_money < company.actual_price * body.quantity) {
      throw new Error("Not enought money in the stock wallet to buy " + body.quantity + " shares."); 
    }
    let currentShares = 0;
    try {
      currentShares = await User.getSharesFromId(body.player_id, company.id);
      currentShares = currentShares.quantity;
    } catch (err_shares) {
      if (err_shares.message.includes("Shares of company")) {
        currentShares = 0;
        await User.insertEmptyShares(body.player_id, company.id);
      }else {
        throw err_shares;
      }
    }

    //BUY SHARES
    await User.updateShares(body.player_id, company.id, Number(Number(currentShares) + Number(body.quantity)));
    //REMOVE MONEY
    await User.updateMoney(body.player_id, player_money - company.actual_price * body.quantity);

    //TODO: UPDATE HISTORY MAKING A NEW REGISTER WITH FORMULA

    res.status(200).json(company);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

