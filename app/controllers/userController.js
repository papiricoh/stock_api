// Importar modelo de usuario
const User = require('../models/db');
const controlerConfig = require("../config/controlerConfig.js");

async function updateOwner(company_id) {
  try {
      let mayor_shareholder = await User.getMayorShareholder(company_id);
      if(mayor_shareholder.quantity <= 0) {
        console.log("The company doesnt have owner asigning to NPC control");
        await User.changeOwner("NPC", company_id);
      }else {
        mayor_shareholder = mayor_shareholder.owner_id;
        if(mayor_shareholder != 'Index' && mayor_shareholder != 'NPC') {
          await User.changeOwner(mayor_shareholder, company_id);
        }
      }
  } catch (owner_error) {
    if (owner_error.message.includes("Shares of company with")) {
      console.log("The company doesnt have owner asigning to NPC control");
      await User.changeOwner("NPC", company_id);
    }else {
      throw owner_error;
    } 
  }
}

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

exports.getCheckUser = async (req, res) => {
  try {
    const { id } = req.params;
    let message = "";
    try {
      await User.getCheckUser(id);
      message = "User logged in";
    } catch (error_user_notFound) {
      if (error_user_notFound.message.includes("Dont have a stock wallet")) {
        await User.insertNewWallet(id);
        message = "User Wallet Created";
      } else {
        throw error_user_notFound;
      }
    }
    res.status(200).json(message);
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

exports.getGroupsList = async (req, res) => {
  try {
    const groups = await User.getAllGroups();
    res.status(200).json(groups);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id.includes("group:")) {
        throw new Error('ID: ' + id + " is not a group identifier format: (group:0000)" );
    }
    const group_id = Number(id.substr(6));
    const group = await User.getGroupById(group_id)
    res.status(200).json(group);
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
        const company = { name: body.name, label: body.label, owner_id: body.owner_id, company_money: body.initial_money - sold_money, total_shares: Number(body.total_shares), owner_shares: body.total_shares - sold_shares, current_price: company_price};
        //TODO SQL INSERTS: COMPANY, HISTORY AND OWNER STOCK WALLET
        const new_company_label = await User.insertNewCompany(company);
        const new_company = await User.getCompanyData(new_company_label);
        await User.insertInitialHistory(new_company.id, company.current_price, body.initial_money);
        await User.insertInitialHistory(new_company.id, company.current_price, body.initial_money);
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

    //UPDATE OWNER
    await updateOwner(company.id);

    //TODO: UPDATE HISTORY MAKING A NEW REGISTER WITH FORMULA
    let new_price = Number((company.actual_price + (company.actual_price * ( body.quantity / company.total_shares ))).toFixed(2));
    let random = (Math.floor(Math.random() * 30) - 4) / 1000;
    if(controlerConfig.RANDOM_PRICE_VARIATION) { //RANDOM_PRICE_VARIATION = TRUE;
      new_price = Number((new_price + (new_price * random)).toFixed(2));
    }
    await User.insertNewHistory(company.id, new_price, company.actual_price * body.quantity);

    res.status(200).json(new_price);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postSellShares = async (req, res) => {
  try {
    const body = req.body; //company_label, player_id, quantity,
    const player_money = await User.getPlayerMoney(body.player_id);
    const company = await User.getCompanyData(body.company_label);
    company.actual_price = await User.getActualPrice(company.id);
    const currentShares = await User.getSharesFromId(body.player_id, company.id);
    const total_owned_shares = await User.getCompanyTotalOwnedShares(company.id);
    
    if(currentShares.quantity < body.quantity) {
      throw new Error("Not enought shares in the stock wallet to sell " + body.quantity + " shares."); 
    }

    //SELL SHARES
    await User.updateShares(body.player_id, company.id, Number(Number(currentShares.quantity) - Number(body.quantity)));
    //ADD MONEY
    await User.updateMoney(body.player_id, player_money + company.actual_price * body.quantity);
    
    //UPDATE OWNER
    await updateOwner(company.id);

    //UPDATE HISTORY MAKING A NEW REGISTER WITH FORMULA
    let new_price = Number((company.actual_price - (company.actual_price * ( body.quantity / company.total_shares ))).toFixed(2));
    let random = (Math.floor(Math.random() * 30) - 26) / 1000;
    if(controlerConfig.RANDOM_PRICE_VARIATION) { //RANDOM_PRICE_VARIATION = TRUE;
      new_price = Number((new_price + (new_price * random)).toFixed(2));
    }
    await User.insertNewHistory(company.id, new_price, company.actual_price * body.quantity);

    res.status(200).json(new_price);
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postDepositMoney = async (req, res) => {
  try {
    const body = req.body; //player_id, deposit
    const player_money = await User.getPlayerMoney(body.player_id);
    await User.updateMoney(body.player_id, Number(player_money) + Number(body.deposit));

    res.status(200).json(Number(player_money) + Number(body.deposit));
  } catch (err) {
    if (err.message.includes("Not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postWithdrawMoney = async (req, res) => {
  try {
    const body = req.body; //player_id, withdraw
    const player_money = await User.getPlayerMoney(body.player_id);
    if(Number(player_money) - Number(body.withdraw) < 0) {
      throw new Error('Not enough money in the wallet to withdraw, wallet: ' + player_money + ' amount to withdraw: ' + body.withdraw );
    }
    await User.updateMoney(body.player_id, Number(player_money) - Number(body.withdraw));

    res.status(200).json(Number(player_money) - Number(body.withdraw));
  } catch (err) {
    if (err.message.includes("Not enough")) {
      res.status(404).json({ error: 'Player Error: ' + err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};

exports.postAbsorbCompany = async (req, res) => {
  try {
    const body = req.body; //owner_id, company_label, group_label
    const company = await User.getCompanyData(body.company_label);
    const group = await User.getGroupByLabel(body.group_label);
    if (body.owner_id == company.owner_id && company.owner_id == group.owner_id) {
      await User.changeOwner('group:' + group.id, company.id);
    }else {
      throw new Error('User: ' + owner_id + ' is not owner of group or company');
    }
    res.status(200).json(group);
  } catch (err) {
    if (err.message.includes("is not owner")) {
      res.status(404).json({ error: 'Player Error: ' + err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
  }
};